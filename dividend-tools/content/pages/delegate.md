+++
title = "Vote delegation"
path = "delegate"
template = "page.html"
+++
<script src="../js/global.js" defer></script>
<script src="../js/delegate.js" defer></script>

<table id="delegate-table" class="display">
  <thead>
    <tr>
      <th>Delegated To</th>
      <th>Delegated From</th>
      <th>MTL</th>
      <th>MTLCity</th>
    </tr>
  </thead>
  <tbody

  </tbody>
</table>

<script>
  window.onload = function(){ drawDelegated(); };
</script>
