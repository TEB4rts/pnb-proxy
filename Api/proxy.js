module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { source, q = 'procurement', resource_id, page = 1, limit = 100, offset = 0 } = req.query;
  const UA = { 'User-Agent': 'Pera-ng-Bayan/1.0', 'Accept': 'application/json, text/html, */*' };

  if (!source || source === 'health') {
    return res.json({ status: 'ok', service: 'Pera ng Bayan Proxy', timestamp: new Date().toISOString() });
  }

  if (source === 'status') {
    const targets = [
      { name: 'data.gov.ph',     url: 'https://data.gov.ph/api/3/action/package_list' },
      { name: 'philgeps.gov.ph', url: 'https://philgeps.gov.ph' },
      { name: 'dbm.gov.ph',      url: 'https://dbm.gov.ph' },
      { name: 'coa.gov.ph',      url: 'https://www.coa.gov.ph' },
    ];
    const results = await Promise.all(targets.map(async (t) => {
      const start = Date.now();
      try {
        const r = await fetch(t.url, { headers: UA, signal: AbortSignal.timeout(8000) });
        return { name: t.name, status: r.ok ? 'ok' : 'error', httpStatus: r.status, ms: Date.now() - start };
      } catch (e) {
        return { name: t.name, status: 'error', error: e.message, ms: Date.now() - start };
      }
    }));
    return res.json({ results, checkedAt: new Date().toISOString() });
  }

  const URLS = {
    datagov_search:  `https://data.gov.ph/api/3/action/package_search?q=${encodeURIComponent(q)}&rows=20`,
    datagov_store:   `https://data.gov.ph/api/3/action/datastore_search?resource_id=${resource_id}&limit=${limit}&offset=${offset}`,
    datagov_list:    `https://data.gov.ph/api/3/action/package_list`,
    datagov_show:    `https://data.gov.ph/api/3/action/package_show?id=${encodeURIComponent(q)}`,
    philgeps_awards: `https://philgeps.gov.ph/GEPSNONPILOT/Tender/AwardNoticeList.aspx?PageIndex=${page}`,
    philgeps_opps:   `https://philgeps.gov.ph/GEPSNONPILOT/Tender/SplashOpportunitiesSearchUI.aspx?PageIndex=${page}`,
  };

  const url = URLS[source];
  if (!url) return res.status(400).json({ error: `Unknown source: "${source}"`, valid: Object.keys(URLS) });

  try {
    const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(20000) });
    const ct = r.headers.get('content-type') || '';
    if (ct.includes('json')) {
      const data = await r.json();
      return res.json({ ...data, _proxy: { source, url, fetchedAt: new Date().toISOString() } });
    }
    return res.send(await r.text());
  } catch (e) {
    return res.status(500).json({ error: e.message, source, url, fetchedAt: new Date().toISOString() });
  }
};
