+++
title = "Shareholders"
path = "shareholders"
template = "page.html"
+++
<script src="/js/shareholders.js" defer></script>

<table id="shareholders-table" class="display">
  <thead>
    <tr>
      <th>Account</th>
      <th>MTL</th>
      <th>Share</th>
      <th>Has EURMTL</th>
    </tr>
  </thead>
  <tbody>

  </tbody>
</table>

<script>
  window.onload = function(){ drawShareholders(); };
</script>
