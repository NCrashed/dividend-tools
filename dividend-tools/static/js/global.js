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