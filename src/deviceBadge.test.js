import { deviceBadgeProps } from './useMultiplayerSync';

test('A and B are rounded squares', () => {
  expect(deviceBadgeProps(0)).toEqual({ label: 'A', shape: 'square', color: '#16a34a' });
  expect(deviceBadgeProps(1)).toEqual({ label: 'B', shape: 'square', color: '#2563eb' });
});

test('C through H are circles', () => {
  expect(deviceBadgeProps(2)).toMatchObject({ label: 'C', shape: 'circle' });
  expect(deviceBadgeProps(7)).toMatchObject({ label: 'H', shape: 'circle' });
});

test('out-of-range index falls back to slot A', () => {
  expect(deviceBadgeProps(99)).toEqual({ label: 'A', shape: 'square', color: '#16a34a' });
});
