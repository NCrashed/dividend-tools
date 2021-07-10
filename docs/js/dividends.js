async function makeDividendsTx(amount, memo, mtl, eurmtl) {
  mtl = (typeof mtl !== 'undefined') ? mtl : await getMtlAsset();
  eurmtl = (typeof eurmtl !== 'undefined') ? eurmtl : await getEurMtlAsset();

  const shares = await loadShareholders(mtl, eurmtl);
  shares.sort((a, b) => a.mtl_share < b.mtl_share);

  const account = await server.loadAccount(mtl_foundation);
  const fee = await server.fetchBaseFee();

  var options = { fee, networkPassphrase: StellarSdk.Networks.PUBLIC };
  if (memo.length > 0) {
      options.memo = StellarSdk.Memo.text(memo);
  }
  var builder = new StellarSdk.TransactionBuilder(account, options);

  shares.forEach(function (a) {
      const dividendAmount = (a.mtl_share * amount).toFixed(7);
      // console.log("Funding", a.account_id, "with", dividendAmount);
      if (dividendAmount > 0 && a.has_eurmtl) {
        builder.addOperation(
          StellarSdk.Operation.payment({
              destination: a.account_id,
              asset: new StellarSdk.Asset(
                  eurmtl.asset_code,
                  eurmtl.asset_issuer
                ),
              amount: dividendAmount.toString(),
          })
        );
      }
    }
  );

  const transaction = builder
        .setTimeout(30)
        .build();

  return transaction
        .toEnvelope()
        .toXDR()
        .toString("base64");
}

async function drawDividends() {
  $( "#view-laboratory" ).hide();
  $( "#dividend-gen" ).click(async function() {
    try {
      $('#tx-error').html("");

      var amount = parseFloat($( "input[name='dividends-amount']").val());
      var memo = $( "input[name='dividends-memo']").val();
      console.log("Generating tx for", amount, "EURMTL and memo: ", memo);
      var tx = await makeDividendsTx(amount, memo);

      $('#dividend-tx').html(tx);
      $('#view-laboratory').show();
      $('#view-laboratory').click(function() {
        window.location = "https://laboratory.stellar.org/#xdr-viewer?type=TransactionEnvelope&network=public&input=" + encodeURIComponent(tx);
      })
    } catch(err) {
      $('#tx-error').html(err);
    }
  });


}
