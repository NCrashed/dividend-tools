async function makeDividendsTx(amount, memo, offset, sequence, mtl, mtl_city, eurmtl) {
  mtl = (typeof mtl !== 'undefined') ? mtl : await getMtlAsset();
  mtl_city = (typeof mtl_city !== 'undefined') ? mtl_city : await getMtlCityAsset();
  eurmtl = (typeof eurmtl !== 'undefined') ? eurmtl : await getEurMtlAsset();

  var shares = (await loadShareholders(mtl, mtl_city, eurmtl)).holders;
  shares = shares.filter(a => a.mtl_balance > 0 && a.has_eurmtl);
  shares = shares.sort((a, b) => b.mtl_balance - a.mtl_balance);

  const account = await server.loadAccount(mtl_foundation, sequence);
  const fee = await server.fetchBaseFee();

  //load list 
  const bigOffset = offset > 0;
  var replenishList = new Map();
  const replenishKey = "GDEK5KGFA3WCG3F2MLSXFGLR4T4M6W6BMGWY6FBDSDQM6HXFMRSTEWBW";
  var replenishAmount = 0.0000000;
  $.ajaxSetup({
      async: false
  });
  $.getJSON('https://raw.githubusercontent.com/montelibero-org/mtl/main/json/bodreplenish.json' ) 
    .done(function( data ) {//
	  //console.log(data);
      for (key in data) {
        if (data.hasOwnProperty(key)) {
          //console.log("key = " + key);
          //console.log("value = " + data[key]);
          replenishList.set(key, data[key]);
        } 
      }
    }) 
  //

  var options = { fee, networkPassphrase: StellarSdk.Networks.PUBLIC };
  if (memo.length > 0) {
      options.memo = StellarSdk.Memo.text(memo);
  }
  var builder = new StellarSdk.TransactionBuilder(account, options);
  var i = 0;

  //console.log('sequence',BigInt(sequence),'account.sequence',BigInt(account.sequence));
  while ((BigInt(sequence) - 1n) > BigInt(account.sequence)) {
    account.incrementSequenceNumber();
    console.log(BigInt(account.sequence)); 	
  }
  //console.log('2sequence',BigInt(sequence),'account.sequence',BigInt(account.sequence),BigInt(account.sequence)+1n);
  
  shares.forEach(function (a) {
	  var dividendAmount = 0.00000;
	  if (replenishList.has(a.account_id)){
		const persent = parseFloat(replenishList.get(a.account_id)); 
		dividendAmount = (a.mtl_share * amount).toFixed(7);
	    var calc = parseFloat(dividendAmount * persent / 100).toFixed(7);
		dividendAmount = parseFloat(dividendAmount - calc).toFixed(7);
		replenishAmount = parseFloat(replenishAmount + calc).toFixed(7);
        //console.log(replenishAmount);
        //console.log("Founding", a.account_id, "with", dividendAmount,'persent ',persent);
	  }
	  else{
		dividendAmount = (a.mtl_share * amount).toFixed(7);
	  }
      //console.log("Funding", a.account_id, "with", dividendAmount);
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
  
  // add replenishAmount
  if (bigOffset){
    console.log(replenishAmount);
    builder.addOperation(
	  StellarSdk.Operation.payment({
		  destination: replenishKey,
		  asset: new StellarSdk.Asset(
			  eurmtl.asset_code,
			  eurmtl.asset_issuer
		    ),
		  amount: replenishAmount.toString(),
	  })
    );
  }
  

  const transaction = builder
        .setTimeout(StellarSdk.TimeoutInfinite)
        .build();

  return transaction
        .toEnvelope()
        .toXDR()
        .toString("base64");
}


async function setSequenceNumber() {
  const account = await server.loadAccount(mtl_foundation);
//	console.log(account.sequence); 
//	console.log(account.sequenceNumber());
//  console.log(account.incrementSequenceNumber());
  account.incrementSequenceNumber();
  $( "input[name='dividends-sequence']").val(account.sequence);
}

async function drawDividends() {
  $( "#view-laboratory" ).hide();
  $( "#dividend-gen" ).click(async function() {
    try {
      $('#tx-error').html("");

      var amount = parseFloat($( "input[name='dividends-amount']").val());
      var memo = $( "input[name='dividends-memo']").val();
      var offset = parseInt($( "input[name='dividends-offset']").val());
      var sequence = $( "input[name='dividends-sequence']").val();
      console.log("Generating tx for", amount, "EURMTL and memo: ", memo, " offset:", offset, "sequence:", sequence);
      var tx = await makeDividendsTx(amount, memo, offset, sequence);

      $('#dividend-tx').html(tx);
      $('#view-laboratory').show();
      $('#view-laboratory').click(function() {
        window.location = "https://laboratory.stellar.org/#xdr-viewer?type=TransactionEnvelope&network=public&input=" + encodeURIComponent(tx);
      })
    } catch(err) {
      $('#tx-error').html(err);
    }
  });
  setSequenceNumber()  


}
