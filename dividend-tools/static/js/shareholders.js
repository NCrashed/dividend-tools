function hasTrustline(account, asset) {
  var desired_balance = account.balances.find(b => b.asset_code == asset.asset_code && b.asset_issuer == asset.asset_issuer);
  return desired_balance !== 'undefined' && desired_balance != null;
}

function getBalance(account, asset) {
  var desired_balance = account.balances.find(b => b.asset_code == asset.asset_code && b.asset_issuer == asset.asset_issuer);
  if (desired_balance == null) {
    return 0.0;
  } else {
    return parseFloat(desired_balance.balance);
  }
}

function log2(x) {
  return Math.log(x) / Math.log(2);
}

function calcLogVote(x) {
  return Math.round(Math.max(0, log2(x / 100)));
}

async function loadAssetAccounts(asset, accumulated_accounts) {
  let page = 100;
  var request = server
        .accounts()
        .forAsset(asset.asset_code + ":" + asset.asset_issuer)
        .limit(page)
        .call();
  var accounts = [];
  do { 
    accounts = await request;
    for (const item of accounts.records) {
      if (!accumulated_accounts.has(item.account_id)) {
        accumulated_accounts.set(item.account_id, item);
      }
    }
    request = accounts.next();
  } while(accounts.records.length > 0)

  return accumulated_accounts;
}

async function loadAccounts(mtl, mtl_city) {
  mtl = (typeof mtl !== 'undefined') ? mtl : await getMtlAsset();
  mtl_city = (typeof mtl_city !== 'undefined') ? mtl_city : await getMtlCityAsset();

  var accumulated_accounts = await loadAssetAccounts(mtl, new Map());
  accumulated_accounts = await loadAssetAccounts(mtl_city, accumulated_accounts);

  return accumulated_accounts;
}

async function loadShareholders(mtl, mtl_city, eurmtl) {
  mtl = (typeof mtl !== 'undefined') ? mtl : await getMtlAsset();
  mtl_city = (typeof mtl_city !== 'undefined') ? mtl_city : await getMtlCityAsset();
  eurmtl = (typeof eurmtl !== 'undefined') ? eurmtl : await getEurMtlAsset();

  try {
    var accumulated_accounts = await loadAccounts(mtl, mtl_city);

    let data = Array.from(accumulated_accounts.values()).map(a => ({
      account_id: a.account_id,
      mtl_balance: getBalance(a, mtl),
      mtl_share: 0.0,
      mtl_vote: 0.0,
      mtl_city_balance: getBalance(a, mtl_city),
      mtl_city_indirect: 0.0,
      mtl_city_share: 0.0,
      mtl_city_vote: 0.0,
      has_eurmtl: hasTrustline(a, eurmtl),
    })).filter(a => a.account_id != mtl_foundation);

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
      a.mtl_city_share = (a.mtl_city_balance + a.mtl_city_indirect) / mtl_city_total;
      a.mtl_vote = vote_blacklist.includes(a.account_id) ? 0 : calcLogVote(a.mtl_balance); 
      a.mtl_city_vote = vote_blacklist.includes(a.account_id) ? 0 : calcLogVote(a.mtl_city_balance + a.mtl_city_indirect);
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
      mtl_city_votes_threshold };
  } catch(err) {
    console.error(err);
  }
}

function makeAccountUrl(id) {
  return '<a href="https://stellar.expert/explorer/public/account/' +
    id + '">' + id.substring(0,10) + '...' + id.substr(id.length - 10) + '</a>';
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
    var map = getBlacklist();
    var data = [];

    for (item of map.entries()) {
      console.log(item);
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

function getBlacklist() {
  var m = new Map();

  m.set("GA5Q2PZWIHSCOHNIGJN4BX5P42B4EMGTYAS3XCMAHEHCFFKCQQ3ZX34A", "Delegated");
  m.set("GDU3D6FAJF2IEAYB73POO7TWSYXY2VRCF66S3QGO72DBLNVG4C7PMQP2", "Self-recusation");
  m.set("GD22O6JVAFG2VENMNW5L7DKLOQCTPHFEWJTKHGPTMUIEL5G2TLF5YITW", "No contact");

  return m;
}

// Public list of accounts that delegates vote or doesn't go in contact with foundation
var vote_blacklist = Array.from(getBlacklist().keys());

