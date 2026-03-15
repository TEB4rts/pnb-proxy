# pnb-proxy

CORS proxy for [Pera ng Bayan](https://github.com/TEB4rts/pera-ng-bayan).

## Deploy to Vercel

1. Create new GitHub repo — name it `pnb-proxy`
2. Upload these 3 files: `api/proxy.js`, `package.json`, `vercel.json`
3. Go to vercel.com → New Project → import `pnb-proxy` → Deploy

## Test

```
/api/proxy?source=health
/api/proxy?source=status
/api/proxy?source=datagov_search&q=procurement
/api/proxy?source=datagov_list
/api/proxy?source=datagov_store&resource_id=XXXX
/api/proxy?source=philgeps_awards&page=1
```
