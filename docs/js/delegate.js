async function loadDelegateTxs(account_id, accumulated_txs, mtl, mtl_city) {
    let page = 100;
    var request = server
            .transactions()
            .forAccount(account_id)
            .limit(page)
            .call();
    var txs = [];
    do { 
        txs = await request;
        // console.log(txs);
        for (const tx of txs.records) {
            if (!accumulated_txs.has(tx.id) && $.trim(tx.memo) == "delegate") {
                console.log(tx);
                accumulated_txs.set(tx.id, { 
                    id: tx.id, 
                    created_at: tx.created_at, 
                    source_account: tx.source_account, 
                });
            }
        }
        request = txs.next();
    } while(txs.records.length > 0)

    return accumulated_txs;
}


async function scanDelegations(mtl, mtl_city, eurmtl) {
    mtl = (typeof mtl !== 'undefined') ? mtl : await getMtlAsset();
    mtl_city = (typeof mtl_city !== 'undefined') ? mtl_city : await getMtlCityAsset();
    eurmtl = (typeof eurmtl !== 'undefined') ? eurmtl : await getEurMtlAsset();

    var data = await loadShareholders(mtl, mtl_city, eurmtl);
    var txs = new Map();

    for (const a of data.holders) {
        console.log("Loading txs for", a.account_id);
        await loadDelegateTxs(a.account_id, txs, mtl, mtl_city);
    }

    return txs;
}

async function drawDelegation() {
    try {

    // var data = await scanDelegations();
    var data = memoDelegations();
    console.log(data);

    var cy = cytoscape({
        container: $('#deletate'),
        elements: [ // list of graph elements to start with
            { // node a
              data: { id: 'a' }
            },
            { // node b
              data: { id: 'b' }
            },
            { // edge ab
              data: { id: 'ab', source: 'a', target: 'b' }
            }
          ],
        
          style: [ // the stylesheet for the graph
            {
              selector: 'node',
              style: {
                'background-color': '#666',
                'label': 'data(id)'
              }
            },
        
            {
              selector: 'edge',
              style: {
                'width': 3,
                'line-color': '#ccc',
                'target-arrow-color': '#ccc',
                'target-arrow-shape': 'triangle',
                'curve-style': 'bezier'
              }
            }
          ],
        
          layout: {
            name: 'grid',
            rows: 1
          }
    });

    //   var data = await getVotes();

      data = Array.from(data.values());

      var i = 1;
      var data = data.map(a => [
        i++,
        makeTxUrl(a.id),
        makeAccountUrl(a.source_account),

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
                if (data[2] != data[3] || data[2] != data[4] || data[5] != data[6]) {
                    $(row).addClass('red-row');
                }
            },
      });
      
    } catch(err) {
      console.error(err);
    }
  }

  function memoDelegations() {
    return new Map(Object.entries({
        "18e14f0876049ec09252daecfb35e0384a1fedce88bed207b08425c26f7cecb0": {
            "memo": "delegate",
            "memo_bytes": "ZGVsZWdhdGU=",
            "_links": {
                "self": {
                    "href": "https://horizon.stellar.org/transactions/18e14f0876049ec09252daecfb35e0384a1fedce88bed207b08425c26f7cecb0"
                },
                "account": {
                    "href": "https://horizon.stellar.org/accounts/GA5Q2PZWIHSCOHNIGJN4BX5P42B4EMGTYAS3XCMAHEHCFFKCQQ3ZX34A"
                },
                "ledger": {
                    "href": "https://horizon.stellar.org/ledgers/35766642"
                },
                "operations": {
                    "href": "https://horizon.stellar.org/transactions/18e14f0876049ec09252daecfb35e0384a1fedce88bed207b08425c26f7cecb0/operations{?cursor,limit,order}",
                    "templated": true
                },
                "effects": {
                    "href": "https://horizon.stellar.org/transactions/18e14f0876049ec09252daecfb35e0384a1fedce88bed207b08425c26f7cecb0/effects{?cursor,limit,order}",
                    "templated": true
                },
                "precedes": {
                    "href": "https://horizon.stellar.org/transactions?order=asc&cursor=153616557678100480"
                },
                "succeeds": {
                    "href": "https://horizon.stellar.org/transactions?order=desc&cursor=153616557678100480"
                },
                "transaction": {
                    "href": "https://horizon.stellar.org/transactions/18e14f0876049ec09252daecfb35e0384a1fedce88bed207b08425c26f7cecb0"
                }
            },
            "id": "18e14f0876049ec09252daecfb35e0384a1fedce88bed207b08425c26f7cecb0",
            "paging_token": "153616557678100480",
            "successful": true,
            "hash": "18e14f0876049ec09252daecfb35e0384a1fedce88bed207b08425c26f7cecb0",
            "created_at": "2021-06-06T14:40:10Z",
            "source_account": "GA5Q2PZWIHSCOHNIGJN4BX5P42B4EMGTYAS3XCMAHEHCFFKCQQ3ZX34A",
            "source_account_sequence": "150596066092253216",
            "fee_account": "GA5Q2PZWIHSCOHNIGJN4BX5P42B4EMGTYAS3XCMAHEHCFFKCQQ3ZX34A",
            "fee_charged": "100",
            "max_fee": "10000",
            "operation_count": 1,
            "envelope_xdr": "AAAAAgAAAAA7DT82QeQnHagyW8Dfr+aDwjDTwCW7iYA5DiKVQoQ3mwAAJxACFwZTAAAAIAAAAAAAAAABAAAACGRlbGVnYXRlAAAAAQAAAAEAAAAAOw0/NkHkJx2oMlvA36/mg8Iw08Alu4mAOQ4ilUKEN5sAAAABAAAAAJ7rDhAdZAgZN822Sz3p6kReKnM4cNDyneAVCo15uteGAAAAAk1UTENJVFkAAAAAAAAAAADoj6aqtmvFJrjhE4Ddhri0neRe/nzuwK/mWVgzVOpurQAAAAAAAAAKAAAAAAAAAAFChDebAAAAQJfCMFDGhZKmuWKkS4K3DgA6SMbKV4GoW4qVz2fandErWdRn9jbKeeqCl0uibvlMXELRU5Nq9tXLZKy2JtLCcgs=",
            "result_xdr": "AAAAAAAAAGQAAAAAAAAAAQAAAAAAAAABAAAAAAAAAAA=",
            "result_meta_xdr": "AAAAAgAAAAIAAAADAiHBcgAAAAAAAAAAOw0/NkHkJx2oMlvA36/mg8Iw08Alu4mAOQ4ilUKEN5sAAAABe9R03AIXBlMAAAAfAAAADwAAAAEAAAAAxHHGQ3BiyVBqiTQuU4oa2kBNL0HPHTolX0Mh98bg4XUAAAAAAAAACWxvYnN0ci5jbwAAAAEAAAAAAAAAAAAAAQAAAAaiIuaAAAAAAAX14QAAAAAAAAAAAAAAAAECIcFyAAAAAAAAAAA7DT82QeQnHagyW8Dfr+aDwjDTwCW7iYA5DiKVQoQ3mwAAAAF71HTcAhcGUwAAACAAAAAPAAAAAQAAAADEccZDcGLJUGqJNC5TihraQE0vQc8dOiVfQyH3xuDhdQAAAAAAAAAJbG9ic3RyLmNvAAAAAQAAAAAAAAAAAAABAAAABqIi5oAAAAAABfXhAAAAAAAAAAAAAAAAAQAAAAQAAAADAiA37gAAAAEAAAAAnusOEB1kCBk3zbZLPenqRF4qczhw0PKd4BUKjXm614YAAAACTVRMQ0lUWQAAAAAAAAAAAOiPpqq2a8UmuOETgN2GuLSd5F7+fO7Ar+ZZWDNU6m6tAAAABvwjrAB//////////wAAAAEAAAAAAAAAAAAAAAECIcFyAAAAAQAAAACe6w4QHWQIGTfNtks96epEXipzOHDQ8p3gFQqNebrXhgAAAAJNVExDSVRZAAAAAAAAAAAA6I+mqrZrxSa44ROA3Ya4tJ3kXv587sCv5llYM1Tqbq0AAAAG/COsCn//////////AAAAAQAAAAAAAAAAAAAAAwIhwVoAAAABAAAAADsNPzZB5CcdqDJbwN+v5oPCMNPAJbuJgDkOIpVChDebAAAAAk1UTENJVFkAAAAAAAAAAADoj6aqtmvFJrjhE4Ddhri0neRe/nzuwK/mWVgzVOpurQAAAAAAmJaAf/////////8AAAABAAAAAQAAAQKyuIcAAAAAAAAAAAAAAAAAAAAAAAAAAAECIcFyAAAAAQAAAAA7DT82QeQnHagyW8Dfr+aDwjDTwCW7iYA5DiKVQoQ3mwAAAAJNVExDSVRZAAAAAAAAAAAA6I+mqrZrxSa44ROA3Ya4tJ3kXv587sCv5llYM1Tqbq0AAAAAAJiWdn//////////AAAAAQAAAAEAAAECsriHAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
            "fee_meta_xdr": "AAAAAgAAAAMCIcFaAAAAAAAAAAA7DT82QeQnHagyW8Dfr+aDwjDTwCW7iYA5DiKVQoQ3mwAAAAF71HVAAhcGUwAAAB8AAAAPAAAAAQAAAADEccZDcGLJUGqJNC5TihraQE0vQc8dOiVfQyH3xuDhdQAAAAAAAAAJbG9ic3RyLmNvAAAAAQAAAAAAAAAAAAABAAAABqIi5oAAAAAABfXhAAAAAAAAAAAAAAAAAQIhwXIAAAAAAAAAADsNPzZB5CcdqDJbwN+v5oPCMNPAJbuJgDkOIpVChDebAAAAAXvUdNwCFwZTAAAAHwAAAA8AAAABAAAAAMRxxkNwYslQaok0LlOKGtpATS9Bzx06JV9DIffG4OF1AAAAAAAAAAlsb2JzdHIuY28AAAABAAAAAAAAAAAAAAEAAAAGoiLmgAAAAAAF9eEAAAAAAAAAAAA=",
            "memo_type": "text",
            "signatures": [
                "l8IwUMaFkqa5YqRLgrcOADpIxspXgahbipXPZ9qd0StZ1Gf2Nsp56oKXS6Ju+UxcQtFTk2r21ctkrLYm0sJyCw=="
            ],
            "ledger_attr": 35766642
        },
        "ed73f717467ff2bf91139240bb8e5d780e1078ef3ab549421ad97b4b05e21354": {
            "memo": "delegate",
            "memo_bytes": "ZGVsZWdhdGU=",
            "_links": {
                "self": {
                    "href": "https://horizon.stellar.org/transactions/ed73f717467ff2bf91139240bb8e5d780e1078ef3ab549421ad97b4b05e21354"
                },
                "account": {
                    "href": "https://horizon.stellar.org/accounts/GA5Q2PZWIHSCOHNIGJN4BX5P42B4EMGTYAS3XCMAHEHCFFKCQQ3ZX34A"
                },
                "ledger": {
                    "href": "https://horizon.stellar.org/ledgers/36361527"
                },
                "operations": {
                    "href": "https://horizon.stellar.org/transactions/ed73f717467ff2bf91139240bb8e5d780e1078ef3ab549421ad97b4b05e21354/operations{?cursor,limit,order}",
                    "templated": true
                },
                "effects": {
                    "href": "https://horizon.stellar.org/transactions/ed73f717467ff2bf91139240bb8e5d780e1078ef3ab549421ad97b4b05e21354/effects{?cursor,limit,order}",
                    "templated": true
                },
                "precedes": {
                    "href": "https://horizon.stellar.org/transactions?order=asc&cursor=156171569297784832"
                },
                "succeeds": {
                    "href": "https://horizon.stellar.org/transactions?order=desc&cursor=156171569297784832"
                },
                "transaction": {
                    "href": "https://horizon.stellar.org/transactions/ed73f717467ff2bf91139240bb8e5d780e1078ef3ab549421ad97b4b05e21354"
                }
            },
            "id": "ed73f717467ff2bf91139240bb8e5d780e1078ef3ab549421ad97b4b05e21354",
            "paging_token": "156171569297784832",
            "successful": true,
            "hash": "ed73f717467ff2bf91139240bb8e5d780e1078ef3ab549421ad97b4b05e21354",
            "created_at": "2021-07-14T03:47:49Z",
            "source_account": "GA5Q2PZWIHSCOHNIGJN4BX5P42B4EMGTYAS3XCMAHEHCFFKCQQ3ZX34A",
            "source_account_sequence": "150596066092253234",
            "fee_account": "GA5Q2PZWIHSCOHNIGJN4BX5P42B4EMGTYAS3XCMAHEHCFFKCQQ3ZX34A",
            "fee_charged": "100",
            "max_fee": "10000",
            "operation_count": 1,
            "envelope_xdr": "AAAAAgAAAAA7DT82QeQnHagyW8Dfr+aDwjDTwCW7iYA5DiKVQoQ3mwAAJxACFwZTAAAAMgAAAAAAAAABAAAACGRlbGVnYXRlAAAAAQAAAAEAAAAAOw0/NkHkJx2oMlvA36/mg8Iw08Alu4mAOQ4ilUKEN5sAAAABAAAAAJ7rDhAdZAgZN822Sz3p6kReKnM4cNDyneAVCo15uteGAAAAAU1UTAAAAAAABKm3owZNa8bB1ZbPOeEZwMn6SWmWnL4MJkNI8TQwb6oAAAAAAAAACgAAAAAAAAABQoQ3mwAAAECUeQka5FxfpN9kiekZkzvMPHueMEUxNBx6bsDnmtdbrU6cmoXFmtKhgC7+bPV97JhgdHtI9Aj8Zcm/DbYYun0F",
            "result_xdr": "AAAAAAAAAGQAAAAAAAAAAQAAAAAAAAABAAAAAAAAAAA=",
            "result_meta_xdr": "AAAAAgAAAAIAAAADAirVNwAAAAAAAAAAOw0/NkHkJx2oMlvA36/mg8Iw08Alu4mAOQ4ilUKEN5sAAAABcvj5CgIXBlMAAAAxAAAAGAAAAAEAAAAAxHHGQ3BiyVBqiTQuU4oa2kBNL0HPHTolX0Mh98bg4XUAAAAAAAAACWxvYnN0ci5jbwAAAAEAAAAAAAAAAAAAAQAAAAsggYeAAAAAADWk6UYAAAAAAAAAAAAAAAECKtU3AAAAAAAAAAA7DT82QeQnHagyW8Dfr+aDwjDTwCW7iYA5DiKVQoQ3mwAAAAFy+PkKAhcGUwAAADIAAAAYAAAAAQAAAADEccZDcGLJUGqJNC5TihraQE0vQc8dOiVfQyH3xuDhdQAAAAAAAAAJbG9ic3RyLmNvAAAAAQAAAAAAAAAAAAABAAAACyCBh4AAAAAANaTpRgAAAAAAAAAAAAAAAQAAAAQAAAADAiqvawAAAAEAAAAAnusOEB1kCBk3zbZLPenqRF4qczhw0PKd4BUKjXm614YAAAABTVRMAAAAAAAEqbejBk1rxsHVls854RnAyfpJaZacvgwmQ0jxNDBvqgAAAHZqGyoNf/////////8AAAABAAAAAQAAAAAAAAAAAAAAAlitk2UAAAAAAAAAAAAAAAECKtU3AAAAAQAAAACe6w4QHWQIGTfNtks96epEXipzOHDQ8p3gFQqNebrXhgAAAAFNVEwAAAAAAASpt6MGTWvGwdWWzznhGcDJ+klplpy+DCZDSPE0MG+qAAAAdmobKhd//////////wAAAAEAAAABAAAAAAAAAAAAAAACWK2TZQAAAAAAAAAAAAAAAwIqLSwAAAABAAAAADsNPzZB5CcdqDJbwN+v5oPCMNPAJbuJgDkOIpVChDebAAAAAU1UTAAAAAAABKm3owZNa8bB1ZbPOeEZwMn6SWmWnL4MJkNI8TQwb6oAAAAB9bIPBH//////////AAAAAQAAAAEAAAECuK5oAAAAAAHawEFAAAAAAAAAAAAAAAABAirVNwAAAAEAAAAAOw0/NkHkJx2oMlvA36/mg8Iw08Alu4mAOQ4ilUKEN5sAAAABTVRMAAAAAAAEqbejBk1rxsHVls854RnAyfpJaZacvgwmQ0jxNDBvqgAAAAH1sg76f/////////8AAAABAAAAAQAAAQK4rmgAAAAAAdrAQUAAAAAAAAAAAAAAAAA=",
            "fee_meta_xdr": "AAAAAgAAAAMCKqh7AAAAAAAAAAA7DT82QeQnHagyW8Dfr+aDwjDTwCW7iYA5DiKVQoQ3mwAAAAFy+PluAhcGUwAAADEAAAAYAAAAAQAAAADEccZDcGLJUGqJNC5TihraQE0vQc8dOiVfQyH3xuDhdQAAAAAAAAAJbG9ic3RyLmNvAAAAAQAAAAAAAAAAAAABAAAACyCBh4AAAAAANaTpRgAAAAAAAAAAAAAAAQIq1TcAAAAAAAAAADsNPzZB5CcdqDJbwN+v5oPCMNPAJbuJgDkOIpVChDebAAAAAXL4+QoCFwZTAAAAMQAAABgAAAABAAAAAMRxxkNwYslQaok0LlOKGtpATS9Bzx06JV9DIffG4OF1AAAAAAAAAAlsb2JzdHIuY28AAAABAAAAAAAAAAAAAAEAAAALIIGHgAAAAAA1pOlGAAAAAAAAAAA=",
            "memo_type": "text",
            "signatures": [
                "lHkJGuRcX6TfZInpGZM7zDx7njBFMTQcem7A55rXW61OnJqFxZrSoYAu/mz1feyYYHR7SPQI/GXJvw22GLp9BQ=="
            ],
            "ledger_attr": 36361527
        }
    }));
}
