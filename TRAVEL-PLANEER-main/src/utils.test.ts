import assert from 'node:assert/strict';
import test from 'node:test';
import { ACTIVITY_POOL, DESTINATIONS } from './data';
import { buildPackingList, generateItinerary } from './utils';

test('generateItinerary builds each slot from the selected style data', () => {
  const destination = DESTINATIONS[0];
  const itinerary = generateItinerary(destination, 3, ['adventure']);

  assert.equal(itinerary.length, 3);
  assert.deepEqual(
    itinerary.flatMap(day => Object.values(day.slots).map(slot => slot[0].style)),
    ['adventure', 'adventure', 'adventure', 'adventure', 'adventure', 'adventure', 'adventure', 'adventure', 'adventure']
  );
  assert.equal(
    itinerary[0].slots.Morning[0].title,
    ACTIVITY_POOL.adventure.find(activity => activity.slot === 'Morning')?.t.replace('{name}', destination.name)
  );
  assert.equal(new Set(itinerary.flatMap(day => Object.values(day.slots).flat()).map(activity => activity.id)).size, 9);
});

test('buildPackingList combines base, climate, and selected style items without duplicates', () => {
  const destination = DESTINATIONS[0];
  const packing = buildPackingList(destination, ['culture', 'culture']);
  const labels = packing.map(item => item.label);

  assert.equal(new Set(labels).size, labels.length);
  assert.ok(labels.includes('Passport & travel documents'));
  assert.ok(labels.includes('Layerable sweater'));
  assert.ok(labels.includes('Modest / temple-appropriate outfit'));
});
