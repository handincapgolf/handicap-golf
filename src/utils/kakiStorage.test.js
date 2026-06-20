import { loadKaki, saveKaki, deleteKaki } from './kakiStorage';

describe('kakiStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('loadKaki returns [] when nothing stored', () => {
    expect(loadKaki()).toEqual([]);
  });

  test('loadKaki returns [] on invalid JSON', () => {
    localStorage.setItem('handincap_kaki', 'not json');
    expect(loadKaki()).toEqual([]);
  });

  test('loadKaki drops malformed entries', () => {
    localStorage.setItem('handincap_kaki', JSON.stringify([
      { id: 'a', names: ['Alice', 'Bob'] },
      { id: 'b' },            // missing names
      { names: ['x'] },       // missing id
      'garbage',
    ]));
    expect(loadKaki()).toEqual([{ id: 'a', names: ['Alice', 'Bob'] }]);
  });

  test('saveKaki stores a group and loadKaki reads it back', () => {
    const list = saveKaki(['Alice', 'Bob']);
    expect(list).toHaveLength(1);
    expect(list[0].names).toEqual(['Alice', 'Bob']);
    expect(typeof list[0].id).toBe('string');
    expect(loadKaki()).toEqual(list);
  });

  test('saveKaki puts most-recent first', () => {
    saveKaki(['Alice', 'Bob']);
    const list = saveKaki(['Carol', 'Dave']);
    expect(list[0].names).toEqual(['Carol', 'Dave']);
    expect(list[1].names).toEqual(['Alice', 'Bob']);
  });

  test('saveKaki dedups order-independently and bumps to top', () => {
    saveKaki(['Alice', 'Bob']);
    saveKaki(['Carol', 'Dave']);
    const list = saveKaki(['Bob', 'Alice']); // same set as first entry
    expect(list).toHaveLength(2);
    expect(list[0].names).toEqual(['Bob', 'Alice']);
    expect(list[1].names).toEqual(['Carol', 'Dave']);
  });

  test('saveKaki dedup is case-sensitive', () => {
    saveKaki(['Alice', 'Bob']);
    const list = saveKaki(['alice', 'bob']);
    expect(list).toHaveLength(2);
  });

  test('saveKaki caps at 5, dropping the oldest', () => {
    saveKaki(['A', 'B']);
    saveKaki(['C', 'D']);
    saveKaki(['E', 'F']);
    saveKaki(['G', 'H']);
    saveKaki(['I', 'J']);
    const list = saveKaki(['K', 'L']); // 6th distinct group
    expect(list).toHaveLength(5);
    expect(list[0].names).toEqual(['K', 'L']);
    expect(list.some(e => e.names[0] === 'A')).toBe(false); // oldest gone
  });

  test('deleteKaki removes by id and persists', () => {
    saveKaki(['Alice', 'Bob']);
    const list = saveKaki(['Carol', 'Dave']);
    const after = deleteKaki(list[0].id, list);
    expect(after).toHaveLength(1);
    expect(after[0].names).toEqual(['Alice', 'Bob']);
    expect(loadKaki()).toEqual(after);
  });
});
