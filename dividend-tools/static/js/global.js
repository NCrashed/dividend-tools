const server = new StellarSdk.Server("https://horizon.stellar.org");

const mtl_foundation = "GDX23CPGMQ4LN55VGEDVFZPAJMAUEHSHAMJ2GMCU2ZSHN5QF4TMZYPIS";

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
  return getAsset("MTL", "GACKTN5DAZGWXRWB2WLM6OPBDHAMT6SJNGLJZPQMEZBUR4JUGBX2UK7V");
}

async function getMtlCityAsset() {
  return getAsset("MTLCITY", "GDUI7JVKWZV4KJVY4EJYBXMGXC2J3ZC67Z6O5QFP4ZMVQM2U5JXK2OK3");
}

async function getEurMtlAsset() {
  return getAsset("EURMTL", "GACKTN5DAZGWXRWB2WLM6OPBDHAMT6SJNGLJZPQMEZBUR4JUGBX2UK7V");
}
