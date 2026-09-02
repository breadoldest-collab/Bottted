function normalizeHost(input) {
  if (!input || typeof input !== 'string') return '';
  let value = input.trim().toLowerCase();
  value = value.replace(/^[a-z][a-z0-9+.-]*:\/\//, '');
  const hostPort = value.split('/')[0].split('?')[0].split('#')[0];
  const host = hostPort.replace(/:\d+$/, '').replace(/^www\./, '');
  return host;
}

function isHostBlocked(urlOrHost, blockedDomains) {
  const host = normalizeHost(urlOrHost);
  if (!host) return false;

  return (blockedDomains || []).some((entry) => {
    const blocked = normalizeHost(entry);
    if (!blocked) return false;
    return host === blocked || host.endsWith(`.${blocked}`);
  });
}

function uniqueNormalizedDomains(domains) {
  const seen = new Set();
  const result = [];
  for (const entry of domains || []) {
    const host = normalizeHost(entry);
    if (!host || seen.has(host)) continue;
    seen.add(host);
    result.push(host);
  }
  return result;
}

function isVisitorBlocked({ pageUrl, referer, origin, blockedDomains }) {
  const list = blockedDomains || [];
  if (list.length === 0) return false;
  return [pageUrl, referer, origin].some((candidate) => isHostBlocked(candidate, list));
}

module.exports = {
  normalizeHost,
  isHostBlocked,
  uniqueNormalizedDomains,
  isVisitorBlocked,
};
