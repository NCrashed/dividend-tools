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
    data = data.sort((a, b) => b.mtl_with_delegation - a.mtl_with_delegation);
    var i = 1;
    var mtl_data = data.map(a => [
      i++,
      makeAccountUrl(a.account_id),
      a.mtl_balance,
      a.mtl_delegated,
      a.mtl_with_delegation,
      a.mtl_vote,
      a.mtl_vote_blockchain,
      a.mtl_issuer_vote_blockchain,
      ]);
    var mtl_table = $('#votes-table-mtl').DataTable({
      data: mtl_data,
      pageLength: 50,
      createdRow: function(row, data, dataIndex) {
        if (data[0] > 20) {
            data[5] = 0;
        }
        if (data[5] !== data[6] || data[5] !== data[7]) {
          $(row).addClass('red-row');
        } else if (data[0] > 20)  {
          $(row).addClass('grey-row');
        }
      },
    });

    data = data.sort((a, b) => b.mtl_city_share - a.mtl_city_share);
    i = 1;
    var city_data = data.map(a => [
      i++,
      makeAccountUrl(a.account_id),
      a.mtl_city_vote,
      a.mtl_city_vote_blockchain,
      ]);
    var mtl_table = $('#votes-table-city').DataTable({
      data: city_data,
      pageLength: 100,
      createdRow: function(row, data, dataIndex) {
        if (data[2] != data[3]) {
          $(row).addClass('red-row');
        } else if (data[0] > 20) {
          $(row).addClass('grey-row');
        }
      },
    });
  } catch(err) {
    console.error(err);
  }
}

function openTab(tabName) {
  var i;
  var x = document.getElementsByClassName("tab");
  for (i = 0; i < x.length; i++) {
    x[i].style.display = "none";
  }
  document.getElementById(tabName).style.display = "block";
}
