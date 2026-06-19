// src/components/icons/Icon.test.js
import { render } from '@testing-library/react';
import Icon from '../Icon';
import { ICONS } from './registry';

test('renders an svg for a known name', () => {
  const { container } = render(<Icon name="flag" />);
  const svg = container.querySelector('svg');
  expect(svg).toBeInTheDocument();
  expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
});

test('applies size to width and height', () => {
  const { container } = render(<Icon name="trophy" size={32} />);
  const svg = container.querySelector('svg');
  expect(svg).toHaveAttribute('width', '32');
  expect(svg).toHaveAttribute('height', '32');
});

test('passes className through', () => {
  const { container } = render(<Icon name="flag" className="mr-1" />);
  expect(container.querySelector('svg')).toHaveClass('mr-1');
});

test('unknown name renders nothing (null), no throw', () => {
  const { container } = render(<Icon name="does-not-exist" />);
  expect(container.querySelector('svg')).toBeNull();
});

test('every registry entry has a non-empty body', () => {
  Object.entries(ICONS).forEach(([name, def]) => {
    expect(def.body, `icon ${name}`).toBeTruthy();
  });
});

test('registry contains all Part 1 icon names', () => {
  const required = [
    'flag','target','water','golfer',
    'check-circle','check','x','x-circle','loading','alert','ban',
    'arrow-right','arrow-left','arrow-up','edit','share','search','link','camera',
    'sync','users','user','device','globe','eye','dot',
    'chart','clipboard','comment','tip',
    'celebrate','trophy','medal-gold','medal-silver','medal-bronze','money-bag','cash',
    'game','home','sound-on','sound-off','bolt','bug','suit-spade','mail',
    'star','star-outline',
  ];
  required.forEach((n) => expect(ICONS[n], `missing ${n}`).toBeDefined());
});
