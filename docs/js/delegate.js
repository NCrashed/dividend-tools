/// Fill mapping from account => how much voices delegated to him (positive) or how much voiced delegate from him (negative)
function fillDelegations(accounts) {
    var delegated = new Map();

    for (const item of accounts) {
        var target = getAccountDelegation(item);
        if (target != null) {
            addDelegation(delegated, target, item.mtl_balance, item.mtl_city_full);
            addDelegation(delegated, item.account_id, -item.mtl_balance, -item.mtl_city_full);
        }
    }

    return delegated;
}

/// Find delegation data entry in account and return it parsed or return null if there is no delegation
function getAccountDelegation(account) {
    if ('mtl_delegate' in account.data_attr) {
        let target = atob(account.data_attr.mtl_delegate);
        return target;
    } else if ('delegate' in account.data_attr) {
        let target = atob(account.data_attr.delegate);
        return target;
    }
    return null;
}

/// Add delegation votes for given target account in map of delegated votes
function addDelegation(delegated, target, mtl_vote, mtl_city_vote) {
    if (delegated.has(target)) {
        var prev = delegated.get(target);
        prev.mtl += mtl_vote;
        prev.mtl_city += mtl_city_vote;
        delegated.set(target, prev);
    } else {
        delegated.set(target, {
        mtl: mtl_vote,
        mtl_city: mtl_city_vote
        })
    }
}

/// Extract delegated amount of votes for MTL for given account id
function getDelegatedMtl(delegated, account_id) {
    if (delegated.has(account_id)) {
        return delegated.get(account_id).mtl;
    } else {
        return 0;
    }
}

/// Extract delegated amount of votes for MTL_CITY for given account id
function getDelegatedCity(delegated, account_id) {
    if (delegated.has(account_id)) {
        return delegated.get(account_id).mtl_city;
    } else {
        return 0;
    }
}

async function loadDelegations(mtl, mtl_city, eurmtl, mtl_rect) {
    mtl = (typeof mtl !== 'undefined') ? mtl : await getMtlAsset();
    mtl_city = (typeof mtl_city !== 'undefined') ? mtl_city : await getMtlCityAsset();
    eurmtl = (typeof eurmtl !== 'undefined') ? eurmtl : await getEurMtlAsset();
    mtl_rect = (typeof mtl_rect !== 'undefined') ? mtl_rect : await getMtlRectAsset();

    try {
        var accumulated_accounts = await loadAccounts(mtl, mtl_city, mtl_rect);

        let data = Array.from(accumulated_accounts.values()).map(a => (
            {
                account_id: a.account_id,
                data_attr: a.data_attr,
                mtl_balance: getBalance(a, mtl) + getBalance(a, mtl_rect),
                mtl_share: 0.0,
                mtl_city_balance: getBalance(a, mtl_city),
                mtl_city_indirect: 0.0,
            }
           )).filter(a => a.account_id != mtl_foundation && a.account_id != mtl_rect_custody);

        let mtl_total = data.reduce((acc, a) => acc + a.mtl_balance, 0.0);
        let foundation_account = accumulated_accounts.get(mtl_foundation);
        let mtl_city_foundation = 0;
        if (foundation_account) {
          mtl_city_foundation = getBalance(foundation_account, mtl_city);
        }

        data = data.map( a => {
            let delegated = getAccountDelegation(a);
            if (delegated == null) {
                return null;
            } else {
                a.delegated_to = delegated;
                a.mtl_share = a.mtl_balance / mtl_total;
                a.mtl_city_indirect = a.mtl_share * mtl_city_foundation;
                a.mtl_city_full = a.mtl_city_balance + a.mtl_city_indirect;
                return a;
            }
        }).filter(a => a != null);

        return data;
    } catch(err) {
        console.error(err);
    }
}

async function drawDelegated() {
    try {
      var holders = await loadDelegations();
      var data = [];

      for (let a of holders) {
          data.push([
            makeAccountUrl(a.delegated_to),
            makeAccountUrl(a.account_id),
            a.mtl_balance,
            a.mtl_city_full,
          ]);
      }
      var table = $('#delegate-table').DataTable({
          data: data,
          pageLength: 100,
          order: [[ 1, 'desc' ]],
      });

    } catch(err) {
      console.error(err);
    }
  }