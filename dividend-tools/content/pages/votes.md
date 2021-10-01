+++
title = "Votes"
path = "votes"
template = "page.html"
+++
<script src="../js/global.js" defer></script>
<script src="../js/shareholders.js" defer></script>
<script src="../js/votes.js" defer></script>

<h4>MTL votes: <span id="mtl_votes_total"></span></h4>
<h4>MTL threshold: <span id="mtl_votes_threshold"></span></h4>
<h4>MTLCITY votes: <span id="mtl_city_votes_total"></span></h4>
<h4>MTLCITY threshold: <span id="mtl_city_votes_threshold"></span></h4>

<label for="votes-memo">Memo: </label>
<input type="text" id="votes-memo" name="votes-memo"/>
<button id="dividend-gen" class="btn success">Generate transaction</button>
<button id="view-laboratory" class="btn success">View in laboratory</button>

<div id="tx-error"></div>
<div id="votes-tx"></div>

<table id="votes-table" class="display">
  <thead>
    <tr>
      <th>Account</th>
      <th>MTL votes expected</th>
      <th>MTL votes blockchain</th>
      <th>MTL issuer votes blockchain</th>
      <th>MTLCITY votes expected</th>
      <th>MTLCITY votes blockchain</th>
    </tr>
  </thead>
  <tbody>

  </tbody>
</table>

<script>
  window.onload = function(){ drawVotes(); };
</script>
