const server = new StellarSdk.Server("https://horizon.stellar.org");

const mtl_foundation = "GDX23CPGMQ4LN55VGEDVFZPAJMAUEHSHAMJ2GMCU2ZSHN5QF4TMZYPIS";

const mtl_issuer = "GACKTN5DAZGWXRWB2WLM6OPBDHAMT6SJNGLJZPQMEZBUR4JUGBX2UK7V";
const city_issuer = "GDUI7JVKWZV4KJVY4EJYBXMGXC2J3ZC67Z6O5QFP4ZMVQM2U5JXK2OK3";
const mtl_rect_custody = "GDASYWP6F44TVNJKZKQ2UEVZOKTENCJFTWVMP6UC7JBZGY4ZNB6YAVD4";

async function getAsset(code, issuer) {
  try {
    let resp = await server
      .assets()
      .forCode(code)
      .forIssuer(issuer)
      .call();
    if (resp.records.length > 0) {
      return resp.records[0];
    } else {
      console.log(resp);
      console.error("Cannot find " + code + " asset!");
    }
  } catch(err) {
    console.error(err);
    console.error("Cannot find " + code + " asset!");
  }
}

async function getMtlAsset() {
  return getAsset("MTL", mtl_issuer);
}

async function getMtlCityAsset() {
  return getAsset("MTLCITY", city_issuer);
}

async function getEurMtlAsset() {
  return getAsset("EURMTL", mtl_issuer);
}

async function getMtlRectAsset() {
  return getAsset("MTLRECT", mtl_issuer);
}

async function getMtlFoundation() {
  try {
    let resp = await server
      .accounts()
      .accountId(mtl_foundation)
      .call();
    return resp;
  } catch(err) {
    console.error(err);
    console.error("Cannot find MTL foundation account!");
  }
}

async function getMtlIssuer() {
  try {
    let resp = await server
      .accounts()
      .accountId(mtl_issuer)
      .call();
    return resp;
  } catch(err) {
    console.error(err);
    console.error("Cannot find MTL issuer account!");
  }
}

async function getCityIssuer() {
  try {
    let resp = await server
      .accounts()
      .accountId(city_issuer)
      .call();
    return resp;
  } catch(err) {
    console.error(err);
    console.error("Cannot find MTLCITY issuer account!");
  }
}

function getSigners(account) {
  var map = new Map();

  for (item of account.signers) {
    map.set(item.key, item);
  }

  return map;
}

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
  return Math.round(Math.max(0, log2(x / 1000))) + 1; // changed from 100 to 600 in https://stellar.expert/explorer/public/tx/193024acd8069bb990273e96f59e1622b065ef39ed1df8963c43073a7d66d8cb
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

async function loadAccounts(mtl, mtl_city, mtl_rect) {
  mtl = (typeof mtl !== 'undefined') ? mtl : await getMtlAsset();
  mtl_city = (typeof mtl_city !== 'undefined') ? mtl_city : await getMtlCityAsset();
  mtl_rect = (typeof mtl_rect !== 'undefined') ? mtl_rect : await getMtlRectAsset();

  var accumulated_accounts = await loadAssetAccounts(mtl, new Map());
  accumulated_accounts = await loadAssetAccounts(mtl_city, accumulated_accounts);
  accumulated_accounts = await loadAssetAccounts(mtl_rect, accumulated_accounts);

  return accumulated_accounts;
}

function makeAccountUrl(id) {
  return '<a href="https://stellar.expert/explorer/public/account/' +
    id + '">' + id.substring(0, 6) + '...' + id.substr(id.length - 60) + '</a>';
}
