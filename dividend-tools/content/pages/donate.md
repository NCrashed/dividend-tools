+++
title = "Donates"
path = "donate"
template = "page.html"
+++
<script src="../js/global.js" defer></script>
<script src="../js/donate.js" defer></script>

<table id="donations-table" class="display">
  <thead>
    <tr>
      <th>Donation From</th>
      <th>Donation To</th>
      <th>Percent</th>
    </tr>
  </thead>
  <tbody

  </tbody>
</table>

<script>
  window.onload = function(){ drawDonations(); };
</script>
