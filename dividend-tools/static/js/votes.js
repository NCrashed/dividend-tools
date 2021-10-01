function getWeight(signers_map, account_id) {
    let res = signers_map.get(account_id);
    if (res) {
        return res.weight;
    } else {
        return 0;
    }
}

async function getVotes(mtl_foundation, mtl_issuer, city_foundation) {
    mtl_foundation = (typeof mtl_foundation !== 'undefined') ? mtl_foundation : await getMtlFoundation();
    mtl_issuer = (typeof mtl_issuer !== 'undefined') ? mtl_issuer : await getMtlIssuer();
    city_foundation = (typeof city_foundation !== 'undefined') ? city_foundation : await getCityIssuer();

    var mtl_signers = getSigners(mtl_foundation);
    var mtl_issuer_signers = getSigners(mtl_issuer);
    var city_signers = getSigners(city_foundation);

    var shares = await loadShareholders();

    shares.holders = shares.holders.map( a => {
        a.mtl_vote_blockchain = getWeight(mtl_signers, a.account_id);
        a.mtl_issuer_vote_blockchain = getWeight(mtl_issuer_signers, a.account_id);
        a.mtl_city_vote_blockchain = getWeight(city_signers, a.account_id);
        return a;
    });
    return shares;
}

async function drawVotes() {
    try {
      var data = await getVotes();

      $("#mtl_votes_total").text(data.mtl_votes_total);
      $("#mtl_votes_threshold").text(data.mtl_votes_threshold);
      $("#mtl_city_votes_total").text(data.mtl_city_votes_total);
      $("#mtl_city_votes_threshold").text(data.mtl_city_votes_threshold);

      data = data.holders.filter(a => a.mtl_vote + a.mtl_city_vote + a.mtl_vote_blockchain + a.mtl_issuer_vote_blockchain + a.mtl_city_vote_blockchain  > 0);
  
      var data = data.map(a => [
        makeAccountUrl(a.account_id),
        a.mtl_vote,
        a.mtl_vote_blockchain,
        a.mtl_issuer_vote_blockchain,
        a.mtl_city_vote,
        a.mtl_city_vote_blockchain,
        ]);
      var table = $('#votes-table').DataTable({
          data: data,
          pageLength: 100,
          order: [[ 1, 'desc' ]],
          createdRow: function(row, data, dataIndex) {
                if (data[1] != data[2] || data[1] != data[3] || data[4] != data[5]){
                    $(row).addClass('red-row');
                }
            },
      });
      
    } catch(err) {
      console.error(err);
    }
  }