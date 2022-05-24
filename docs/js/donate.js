/// Fill mapping from account => account how much divs delegated
function fillDonations(accounts) {
    var donations = new Map();

    for (const item of accounts) {
        var res = getAccountDonations(item);
        for (r of res) {
            addDonation(donations, item.account_id, r.target, r.amount);
        }
    }

    return donations;
}

/// Find delegation data entry in account and return it parsed or return null if there is no delegation
function getAccountDonations(account) {
    let res = new Array();
    for (const [key, value] of Object.entries(account.data_attr)) {
        if (key.includes('mtl_donate')) {
            let amount = parseInt(key.split('=')[1]);
            let target = atob(account.data_attr[key]);
            console.log(`${key}: ${amount} => ${target}`);
            res.push({
                amount: amount,
                target: target,
            });
        }
    }
    return res;
}

/// Add donation amount for given target account in map of donations
function addDonation(donations, source, target, amount) {
    let key = [source, target];
    if (donations.has(key)) {
        var prev = donations.get(key);
        prev += amount;
        donations.set(key, prev);
    } else {
        donations.set(key, amount);
    }
}

/// Extract percent of donated divs from source to target
function getDonations(delegated, source, target) {
    let key = [source, target];
    if (delegated.has(key)) {
        return delegated.get(key);
    } else {
        return 0;
    }
}

async function loadDonations(mtl, mtl_city, mtl_rect) {
    mtl = (typeof mtl !== 'undefined') ? mtl : await getMtlAsset();
    mtl_city = (typeof mtl_city !== 'undefined') ? mtl_city : await getMtlCityAsset();
    mtl_rect = (typeof mtl_rect !== 'undefined') ? mtl_rect : await getMtlRectAsset();

    try {
        var accumulated_accounts = await loadAccounts(mtl, mtl_city, mtl_rect);

        let data = Array.from(accumulated_accounts.values()).map(a => (
            {
                account_id: a.account_id,
                data_attr: a.data_attr,
            }
           )).filter(a => a.account_id != mtl_foundation && a.account_id != mtl_rect_custody);

        return fillDonations(data);
    } catch(err) {
        console.error(err);
    }
}

async function drawDonations() {
    try {
      var donations = await loadDonations();
      var data = [];

      for (const [[acc_from, acc_to], amount] of donations.entries()) {
          data.push([
            makeAccountUrl(acc_from),
            makeAccountUrl(acc_to),
            amount,
          ]);
      }
      var table = $('#donations-table').DataTable({
          data: data,
          pageLength: 100,
          order: [[ 1, 'desc' ]],
      });

    } catch(err) {
      console.error(err);
    }
  }