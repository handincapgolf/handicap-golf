import { getBaccaratUpLabel } from './BaccaratComponents';

test('UP label uses a plain digit, not a circled glyph', () => {
  // upOrder[0] is the first UP → position 1
  expect(getBaccaratUpLabel('Alice', ['Alice', 'Bob'])).toBe('UP 1');
  expect(getBaccaratUpLabel('Bob', ['Alice', 'Bob'])).toBe('UP 2');
  expect(getBaccaratUpLabel('Nobody', ['Alice'])).toBe('UP');
});
