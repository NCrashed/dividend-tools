+++
title = "Delegation"
path = "delegate"
template = "page.html"
+++
<script src="../js/cytoscape.min.js" defer></script>
<script src="../js/global.js" defer></script>
<script src="../js/shareholders.js" defer></script>
<script src="../js/delegate.js" defer></script>

<div id="deletate"></div>

<table id="delegate-table" class="display">
  <thead>
    <tr>
      <th>#</th>
      <th>Tx</th>
      <th>From</th>
      <th>To</th>
      <th>Time</th>
    </tr>
  </thead>
  <tbody

  </tbody>
</table>

<script>
  window.onload = function(){ drawDelegation(); };
</script>
