import { findNextUnplayedHole } from './holeNavigation';

describe('findNextUnplayedHole', () => {
  const holes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

  test('linear: returns the next hole forward', () => {
    // played 1-5, just finished hole 5 (index 4) → next is index 5 (hole 6)
    expect(findNextUnplayedHole(holes, [1, 2, 3, 4, 5], 4)).toEqual({ index: 5, wrapped: false });
  });

  test('forward search starts strictly after fromIndex', () => {
    // just finished hole 1 (index 0), played [1] → next index 1 (hole 2)
    expect(findNextUnplayedHole(holes, [1], 0)).toEqual({ index: 1, wrapped: false });
  });

  test('forward skip over already-played holes', () => {
    // played 1-5 and 15, just finished hole 15 (index 14) → next forward is index 15 (hole 16)
    expect(findNextUnplayedHole(holes, [1, 2, 3, 4, 5, 15], 14)).toEqual({ index: 15, wrapped: false });
  });

  test('wrap: nothing forward, returns earliest unplayed with wrapped=true', () => {
    // played 1-5,15,16,17,18, just finished hole 18 (index 17) → wrap to index 5 (hole 6)
    expect(findNextUnplayedHole(holes, [1, 2, 3, 4, 5, 15, 16, 17, 18], 17)).toEqual({ index: 5, wrapped: true });
  });

  test('returns null when every hole is played', () => {
    expect(findNextUnplayedHole(holes, holes, 17)).toBeNull();
  });
});
