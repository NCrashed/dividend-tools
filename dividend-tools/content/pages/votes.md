+++
title = "Votes"
path = "votes"
template = "page.html"
+++
<script src="../js/shareholders.js" defer></script>
<script src="../js/votes.js" defer></script>

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
