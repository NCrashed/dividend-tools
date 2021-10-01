
async function drawVotes() {
    try {
      var data = await loadShareholders();
      $("#mtl_votes_total").text(data.mtl_votes_total);
      $("#mtl_votes_threshold").text(data.mtl_votes_threshold);
      $("#mtl_city_votes_total").text(data.mtl_city_votes_total);
      $("#mtl_city_votes_threshold").text(data.mtl_city_votes_threshold);

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