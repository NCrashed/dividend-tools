async function loadShareholders(mtl, mtl_city, eurmtl, mtl_rect) {
  mtl = (typeof mtl !== 'undefined') ? mtl : await getMtlAsset();
  mtl_city = (typeof mtl_city !== 'undefined') ? mtl_city : await getMtlCityAsset();
  eurmtl = (typeof eurmtl !== 'undefined') ? eurmtl : await getEurMtlAsset();
  mtl_rect = (typeof mtl_rect !== 'undefined') ? mtl_rect : await getMtlRectAsset();

  try {
    var accumulated_accounts = await loadAccounts(mtl, mtl_city, mtl_rect);

    let data = Array.from(accumulated_accounts.values()).map(a => ({
      account_id: a.account_id,
      data_attr: a.data_attr,
      mtl_balance: getBalance(a, mtl) + getBalance(a, mtl_rect),
      mtl_share: 0.0,
      mtl_vote: 0.0,
      mtl_city_balance: getBalance(a, mtl_city),
      mtl_city_indirect: 0.0,
      mtl_city_share: 0.0,
      mtl_city_vote: 0.0,
      has_eurmtl: hasTrustline(a, eurmtl),
    })).filter(a => a.account_id != mtl_foundation && a.account_id != mtl_rect_custody);

    let mtl_total = data.reduce((acc, a) => acc + a.mtl_balance, 0.0);
    console.log("Total MTL hodl: ", mtl_total);
    let distributed_city = data.reduce((acc, a) => acc + a.mtl_city_balance, 0.0);
    console.log("Distributed MTLCITY hodl: ", distributed_city);
    let foundation_account = accumulated_accounts.get(mtl_foundation);
    let mtl_city_foundation = 0;
    if (foundation_account) {
      mtl_city_foundation = getBalance(foundation_account, mtl_city);
    }
    console.log("Foundation has ", mtl_city_foundation, " MTLCITY");
    let mtl_city_total = distributed_city + mtl_city_foundation;
    console.log("Total MTLCITY: ", mtl_city_total);

    data = data.map( a => {
      a.mtl_share = a.mtl_balance / mtl_total;
      a.mtl_city_indirect = a.mtl_share * mtl_city_foundation;
      a.mtl_city_full = a.mtl_city_balance + a.mtl_city_indirect;
      a.mtl_city_share = a.mtl_city_full / mtl_city_total;
      return a;
    });

    var delegated = fillDelegations(data);
    console.log(delegated);
    data = data.map( a => {
      a.mtl_with_delegation = a.mtl_balance + getDelegatedMtl(delegated, a.account_id);
      a.mtl_city_with_delegation = a.mtl_city_full + getDelegatedCity(delegated, a.account_id);
      return a;
    });

    var vote_blacklist = Object.keys(await getBlacklist());
    console.log("Blacklist ", vote_blacklist);
    data = data.map( a => {
      a.mtl_vote = vote_blacklist.includes(a.account_id) ? 0 : calcLogVote(a.mtl_with_delegation);
      a.mtl_city_vote = vote_blacklist.includes(a.account_id) ? 0 : calcLogVote(a.mtl_city_with_delegation);
      return a;
    });

    let maximum_signers = 20;

    let mtl_votes_data = data.sort((a, b) => b.mtl_balance - a.mtl_balance).slice(0, maximum_signers);
    let mtl_votes_total = mtl_votes_data.reduce((acc, a) => acc + a.mtl_vote, 0.0);

    let city_votes_data = data.sort((a, b) => b.mtl_city_share - a.mtl_city_share).slice(0, maximum_signers);
    let mtl_city_votes_total = city_votes_data.reduce((acc, a) => acc + a.mtl_city_vote, 0.0);

    let mtl_votes_threshold = Math.ceil(mtl_votes_total / 2);
    let mtl_city_votes_threshold = Math.ceil(mtl_city_votes_total / 2);

    return { holders: data,
      mtl_total, distributed_city,
      mtl_city_foundation,
      mtl_city_total,
      mtl_votes_total,
      mtl_city_votes_total,
      mtl_votes_threshold,
      mtl_city_votes_threshold,
      delegated };
  } catch(err) {
    console.error(err);
  }
}

async function drawShareholders() {
  try {
    var data = await loadShareholders();
    // console.log(data);
    $("#mtl_total").text(data.mtl_total);
    $("#distributed_city").text(data.distributed_city);
    $("#mtl_city_foundation").text(data.mtl_city_foundation);
    $("#mtl_city_total").text(data.mtl_city_total);
    $("#mtl_votes_total").text(data.mtl_votes_total);
    $("#mtl_votes_threshold").text(data.mtl_votes_threshold);
    $("#mtl_city_votes_total").text(data.mtl_city_votes_total);
    $("#mtl_city_votes_threshold").text(data.mtl_city_votes_threshold);

    data = data.holders.sort((a, b) => b.mtl_balance - a.mtl_balance);
    var i = 1;

    data = data.map(a => [
      i++,
      makeAccountUrl(a.account_id),
      a.mtl_balance,
      (a.mtl_share * 100).toFixed(3).toString() + "%",
      a.mtl_vote,
      a.mtl_city_balance,
      a.mtl_city_indirect,
      (a.mtl_city_share * 100).toFixed(3).toString() + "%",
      a.mtl_city_vote,
      a.has_eurmtl,
      ]);
    var table = $('#shareholders-table').DataTable({
        data: data,
        pageLength: 100,
        // order: [[ 1, 'desc' ]],
    });

  } catch(err) {
    console.error(err);
  }
}

async function drawBlacklist() {
  try {
    var map = new Map(Object.entries(await getBlacklist()));
    var data = [];

    for (item of map.entries()) {
      data.push([
        makeAccountUrl(item[0]),
        item[1],
      ]);
    }

    var table = $('#blacklist-table').DataTable({
        data: data,
        pageLength: 100,
        order: [[ 1, 'desc' ]],
    });

  } catch(err) {
    console.error(err);
  }
}

// Public list of accounts that delegates vote or doesn't go in contact with foundation
async function getBlacklist() {
  const response = await fetch('https://raw.githubusercontent.com/montelibero-org/mtl/main/json/blacklist.json');
  const data = await response.json();
  return data;
}