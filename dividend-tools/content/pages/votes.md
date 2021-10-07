+++
title = "Votes"
path = "votes"
template = "page.html"
+++
<script src="../js/global.js" defer></script>
<script src="../js/shareholders.js" defer></script>
<script src="../js/votes.js" defer></script>

<div class="tab-bar">
  <button class="tab-bar-item btn" onclick="openTab('MTL')">MTL</button>
  <button class="tab-bar-item btn" onclick="openTab('MTLCITY')">MTLCITY</button>
</div> 

<div id="MTL" class="tab">
  <h4>MTL votes: <span id="mtl_votes_total"></span></h4>
  <h4>MTL threshold: <span id="mtl_votes_threshold"></span></h4>

  <table id="votes-table-mtl" class="display">
    <thead>
      <tr>
        <th>#</th>
        <th>Account</th>
        <th>MTL votes expected</th>
        <th>MTL votes blockchain</th>
        <th>MTL issuer votes blockchain</th>
      </tr>
    </thead>
    <tbody>
  </table>

</div>

<div id="MTLCITY" class="tab" style="display:none">
  <h4>MTLCITY votes: <span id="mtl_city_votes_total"></span></h4>
  <h4>MTLCITY threshold: <span id="mtl_city_votes_threshold"></span></h4>

  <table id="votes-table-city" class="display">
    <thead>
      <tr>
        <th>#</th>
        <th>Account</th>
        <th>MTLCITY votes expected</th>
        <th>MTLCITY votes blockchain</th>
      </tr>
    </thead>
    <tbody>
  </table>

</div>


<!-- <label for="votes-memo">Memo: </label>
<input type="text" id="votes-memo" name="votes-memo"/>
<button id="dividend-gen" class="btn success">Generate transaction</button>
<button id="view-laboratory" class="btn success">View in laboratory</button>

<div id="tx-error"></div>
<div id="votes-tx"></div> -->


<script>
  window.onload = function(){ drawVotes(); };
</script>
