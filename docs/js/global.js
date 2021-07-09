const server = new StellarSdk.Server("https://horizon.stellar.org");

const mtl_foundation = "GDX23CPGMQ4LN55VGEDVFZPAJMAUEHSHAMJ2GMCU2ZSHN5QF4TMZYPIS";

async function getMtlAsset() {
  try {
    let resp = await server
      .assets()
      .forCode("MTL")
      .forIssuer("GACKTN5DAZGWXRWB2WLM6OPBDHAMT6SJNGLJZPQMEZBUR4JUGBX2UK7V")
      .call();
    if (resp.records.length > 0) {
      return resp.records[0];
    } else {
      console.log(resp);
      console.error("Cannot find MTL asset!");
    }
  } catch(err) {
    console.error(err);
    console.error("Cannot find MTL asset!");
  }
}

async function getEurMtlAsset() {
  try {
    let resp = await server
      .assets()
      .forCode("EURMTL")
      .forIssuer("GACKTN5DAZGWXRWB2WLM6OPBDHAMT6SJNGLJZPQMEZBUR4JUGBX2UK7V")
      .call();
    if (resp.records.length > 0) {
      return resp.records[0];
    } else {
      console.log(resp);
      console.error("Cannot find EURMTL asset!");
    }
  } catch(err) {
    console.error(err);
    console.error("Cannot find EURMTL asset!");
  }
}
