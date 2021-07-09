async function loadShareholders() {
  var mtl = await getMtlAsset();
  var eurmtl = await getEurMtlAsset();
  try {
    let accounts = await server
      .accounts()
      .forAsset("MTL:" + mtl.asset_issuer)
      .limit(100)
      .call();

    console.log(accounts);

    let data = accounts.records.map(a => ({
      account_id: a.account_id,
      mtl_balance: parseFloat(a.balances.find(b => b.asset_code == "MTL" && b.asset_issuer == mtl.asset_issuer).balance),
      mtl_share: 0.0,
      has_eurmtl: a.balances.find(b => b.asset_code == "EURMTL" && b.asset_issuer == eurmtl.asset_issuer) != null,
    })).filter(a => a.account_id != mtl_foundation );

    let total_mtl = data.reduce((acc, a) => acc + a.mtl_balance, 0.0);
    console.log("Total MTL hodl: ", total_mtl);

    return data.map( a => { a.mtl_share = a.mtl_balance / total_mtl; return a } );

  } catch(err) {
    console.error(err);
  }
}

async function drawShareholders() {
  try {
    var data = await loadShareholders();
    // console.log(data);
    var data = data.map(a => [
      '<a href="https://stellar.expert/explorer/public/account/' +
        a.account_id + '">' + a.account_id.substring(0,10) + '...' + a.account_id.substr(a.account_id.length - 10) + '</a>',
      a.mtl_balance,
      (a.mtl_share * 100).toFixed(3).toString() + "%",
      a.has_eurmtl,
      ]);
    var table = $('#shareholders-table').DataTable({
        data: data,
        pageLength: 100,
        order: [[ 1, 'desc' ]],
    });

  } catch(err) {
    console.error(err);
  }
}
