
async function drawVotes() {
    try {
      var data = await loadShareholders();
      data = data.holders.filter(a => a.mtl_vote + a.mtl_city_vote > 0);

      var data = data.map(a => [
        makeAccountUrl(a.account_id),
        a.mtl_vote,
        a.mtl_vote,
        a.mtl_city_vote,
        a.mtl_city_vote,
        ]);
      var table = $('#votes-table').DataTable({
          data: data,
          pageLength: 100,
          order: [[ 1, 'desc' ]],
      });
      
    } catch(err) {
      console.error(err);
    }
  }