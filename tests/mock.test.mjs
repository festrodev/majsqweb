import assert from 'node:assert/strict';
import { picks, readProfile, replyTo } from '../src/components/mock/data.ts';

const profile = { name: 'Alex', interests: ['food', 'events'], note: 'A quiet evening', locale: 'en' };
assert.deepEqual(readProfile(JSON.stringify(profile)), profile);
for (const value of [null, '{broken', '{}', JSON.stringify({ ...profile, name: ' ' }), JSON.stringify({ ...profile, interests: [] }), JSON.stringify({ ...profile, interests: ['unknown'] }), JSON.stringify({ ...profile, locale: 'xx' })]) {
  assert.equal(readProfile(value), null);
}
for (const [query, id] of [['Somewhere to eat?', 'food'], ['Live music tonight', 'events'], ['Un peu de sport', 'sports'], ['Un bon resto ?', 'food']]) {
  assert.equal(replyTo(query, 'en').id, id);
}
assert.equal(replyTo('hello', 'en').id, undefined);
assert.match(replyTo('bonjour', 'fr').text, /On commence/);
assert.equal(new Set(picks.map(p => p.id)).size, 3);
console.log('Mock profile validation and bilingual chat checks passed.');
