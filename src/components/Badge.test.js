// src/components/Badge.test.js
import { render, screen } from '@testing-library/react';
import Badge from './Badge';

test('renders label inside a circle badge', () => {
  render(<Badge label="1" />);
  const el = screen.getByText('1');
  expect(el).toBeInTheDocument();
  expect(el).toHaveStyle({ borderRadius: '50%' });
});

test('square shape uses rounded-square radius', () => {
  render(<Badge label="A" shape="square" />);
  expect(screen.getByText('A')).toHaveStyle({ borderRadius: '28%' });
});

test('passes through background color and size', () => {
  render(<Badge label="C" color="#64748b" size={40} />);
  const el = screen.getByText('C');
  expect(el).toHaveStyle({ background: '#64748b', width: '40px', height: '40px' });
});
