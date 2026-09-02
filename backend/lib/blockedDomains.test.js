const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  normalizeHost,
  isHostBlocked,
  uniqueNormalizedDomains,
  isVisitorBlocked,
} = require('./blockedDomains');

test('normalizeHost strips protocol, path, port, and www', () => {
  assert.equal(normalizeHost('https://WWW.Example.com:443/path?q=1'), 'example.com');
  assert.equal(normalizeHost('example.com/foo'), 'example.com');
  assert.equal(normalizeHost(''), '');
});

test('isHostBlocked matches exact hosts and subdomains', () => {
  const blocked = ['blocked.example', 'https://other.test/path'];
  assert.equal(isHostBlocked('https://blocked.example/page', blocked), true);
  assert.equal(isHostBlocked('https://shop.blocked.example', blocked), true);
  assert.equal(isHostBlocked('https://www.other.test', blocked), true);
  assert.equal(isHostBlocked('https://allowed.example', blocked), false);
  assert.equal(isHostBlocked('notblocked.example', blocked), false);
});

test('uniqueNormalizedDomains de-duplicates', () => {
  assert.deepEqual(
    uniqueNormalizedDomains(['https://A.com/x', 'www.a.com', 'b.com', '']),
    ['a.com', 'b.com']
  );
});

test('isVisitorBlocked uses pageUrl, referer, or origin', () => {
  const blockedDomains = ['bad-site.test'];
  assert.equal(isVisitorBlocked({ pageUrl: 'https://bad-site.test/home', blockedDomains }), true);
  assert.equal(isVisitorBlocked({ referer: 'https://bad-site.test/', blockedDomains }), true);
  assert.equal(isVisitorBlocked({ origin: 'https://ok.test', blockedDomains }), false);
  assert.equal(isVisitorBlocked({ pageUrl: 'https://ok.test', blockedDomains: [] }), false);
});
