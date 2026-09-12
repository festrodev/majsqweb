import assert from 'node:assert/strict';
import { calendar, picks, readProfile, replyTo } from '../src/components/mock/data.ts';

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

for (const pick of picks) {
  assert.ok(pick.latitude > 45.50 && pick.latitude < 45.55, 'Mock pin stays in Montréal');
  assert.ok(pick.longitude > -73.60 && pick.longitude < -73.55, 'Mock pin stays in Montréal');
  assert.match(pick.time, /^(?:[01]\d|2[0-3]):[0-5]\d$/);
}

// The agenda grid spans 15:00–24:00 and stacks nothing, so events must fit and never overlap.
const slots = [...calendar, ...picks].sort((a, b) => a.time.localeCompare(b.time));
slots.forEach((e, i) => {
  assert.ok(e.time >= '15:00' && e.time < e.end, `${e.id} fits the agenda grid`);
  if (i) assert.ok(slots[i - 1].end <= e.time, `${slots[i - 1].id} and ${e.id} do not overlap`);
});
