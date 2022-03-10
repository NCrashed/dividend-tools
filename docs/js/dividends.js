async function makeDividendsTx(amount, memo, offset, mtl, mtl_city, eurmtl, mtl_rect) {
  mtl = (typeof mtl !== 'undefined') ? mtl : await getMtlAsset();
  mtl_city = (typeof mtl_city !== 'undefined') ? mtl_city : await getMtlCityAsset();
  eurmtl = (typeof eurmtl !== 'undefined') ? eurmtl : await getEurMtlAsset();
  mtl_rect = (typeof mtl_rect !== 'undefined') ? mtl_rect : await getMtlRectAsset();

  var shares = (await loadShareholders(mtl, mtl_city, eurmtl, mtl_rect, mtl_rect)).holders;
  shares = shares.filter(a => a.mtl_balance > 0 && a.has_eurmtl);
  shares = shares.sort((a, b) => b.mtl_balance - a.mtl_balance);

  const account = await server.loadAccount(mtl_foundation);
  const fee = await server.fetchBaseFee();

  var options = { fee, networkPassphrase: StellarSdk.Networks.PUBLIC };
  if (memo.length > 0) {
      options.memo = StellarSdk.Memo.text(memo);
  }
  var builder = new StellarSdk.TransactionBuilder(account, options);
  var i = 0;
  if (offset > 0) {
    account.incrementSequenceNumber();
  }
  shares.forEach(function (a) {
      const dividendAmount = (a.mtl_share * amount).toFixed(7);
      // console.log("Funding", a.account_id, "with", dividendAmount);
      if (offset > 0) {
        offset = offset - 1;
      } else if (dividendAmount > 0 && a.has_eurmtl) {
        if (i < 100) {
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
          i += 1;
        } else {
          console.log("WARNING! There is limit of 100 operations. Distirbution to", a.account_id, "of", dividendAmount, "EURMTL skipped!");
        }
      }
    }
  );

  const transaction = builder
        .setTimeout(StellarSdk.TimeoutInfinite)
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
      var offset = parseInt($( "input[name='dividends-offset']").val());
      console.log("Generating tx for", amount, "EURMTL and memo: ", memo, " offset:", offset);
      var tx = await makeDividendsTx(amount, memo, offset);

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
