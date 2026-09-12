// Run: node --conditions=react-server tests/connect.test.mjs  (react-server lets "server-only" import)
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { seal, start, unseal } from '../src/lib/connect.ts';

const { url, cookie } = start();
const q = new URL(url).searchParams;
const pending = unseal(cookie);
assert.ok(url.startsWith('https://festro.com/connect/authorize?client_id=fc_majsq&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fconnect%2Fcallback&'));
assert.match(pending.verifier, /^[A-Za-z0-9_-]{64}$/);
assert.equal(q.get('state'), pending.state);
assert.equal(q.get('code_challenge'), createHash('sha256').update(pending.verifier).digest('base64url'));
assert.ok(!url.includes(pending.verifier), 'verifier never leaves the server in clear');

const [iv, body, tag] = seal({ state: 's', verifier: 'v' }).split('.');
assert.equal(unseal(`${iv}.${body.slice(0, -2)}AA.${tag}`), null, 'tampered body rejected');
assert.equal(unseal(`${iv}.${body}.${tag.slice(0, 6)}`), null, 'truncated tag rejected');
assert.equal(unseal(undefined), null);
assert.equal(unseal('garbage'), null);
console.log('Connect handshake checks passed.');
