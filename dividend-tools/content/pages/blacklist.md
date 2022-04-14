+++
title = "Vote blacklist"
path = "blacklist"
template = "page.html"
+++
<script src="../js/global.js" defer></script>
<script src="../js/delegate.js" defer></script>
<script src="../js/shareholders.js" defer></script>

<table id="blacklist-table" class="display">
  <thead>
    <tr>
      <th>Account</th>
      <th>Reason</th>
    </tr>
  </thead>
  <tbody

  </tbody>
</table>

<script>
  window.onload = function(){ drawBlacklist(); };
</script>
