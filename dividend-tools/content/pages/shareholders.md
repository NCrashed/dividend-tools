+++
title = "Shareholders"
path = "shareholders"
template = "page.html"
+++
<script src="../js/global.js" defer></script>
<script src="../js/shareholders.js" defer></script>

<h4>Total MTL: <span id="mtl_total"></span></h4>
<h4>Distributed MTLCITY: <span id="distributed_city"></span></h4>
<h4>Foundation MTLCITY: <span id="mtl_city_foundation"></span></h4>
<h4>Total MTLCITY: <span id="mtl_city_total"></span></h4>

<br>

<h4>MTL votes: <span id="mtl_votes_total"></span></h4>
<h4>MTL threshold: <span id="mtl_votes_threshold"></span></h4>
<h4>MTLCITY votes: <span id="mtl_city_votes_total"></span></h4>
<h4>MTLCITY threshold: <span id="mtl_city_votes_threshold"></span></h4>

<table id="shareholders-table" class="display">
  <thead>
    <tr>
      <th>#</th>
      <th>Account</th>
      <th>MTL</th>
      <th>MTL share</th>
      <th>MTL votes</th>
      <th>MTLCITY direct</th>
      <th>MTLCITY indirect</th>
      <th>MTLCITY share</th>
      <th>MTLCITY votes</th>
      <th>Has EURMTL</th>
    </tr>
  </thead>
  <tbody>

  </tbody>
</table>

<script>
  window.onload = function(){ drawShareholders(); };
</script>
