+++
title = "Dividends"
path = "dividends"
template = "page.html"
+++
<script src="../js/global.js" defer></script>
<script src="../js/shareholders.js" defer></script>
<script src="../js/dividends.js" defer></script>

<label for="dividends-amount">EURMTL to spread: </label>
<input type="text" id="dividends-amount" name="dividends-amount" value="10"/>
<label for="dividends-memo">Memo: </label>
<input type="text" id="dividends-memo" name="dividends-memo"/>
<label for="dividends-offset">Offset: </label>
<input type="text" id="dividends-offset" name="dividends-offset" value="0"/>
<button id="dividend-gen" class="btn success">Generate transaction</button>
<button id="view-laboratory" class="btn success">View in laboratory</button>

<div id="tx-error"></div>
<div id="dividend-tx"></div>

<script>
  window.onload = function(){ drawDividends(); };
</script>
