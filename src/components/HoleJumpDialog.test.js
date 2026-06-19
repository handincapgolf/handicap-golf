import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { HoleJumpDialog } from './HoleDialogs';

const t = (k) => k;

test('lists all holes, disables played ones, selects an unplayed hole', () => {
  const onSelect = jest.fn();
  render(
    <HoleJumpDialog
      isOpen={true}
      onClose={() => {}}
      holes={[1, 2, 3, 4, 5]}
      completedHoles={[1, 2]}
      currentHole={2}
      onSelect={onSelect}
      t={t}
      pars={{}}
    />
  );
  expect(screen.getByRole('button', { name: '1' })).toBeDisabled();
  expect(screen.getByRole('button', { name: '2' })).toBeDisabled();
  const hole4 = screen.getByRole('button', { name: '4' });
  expect(hole4).not.toBeDisabled();
  fireEvent.click(hole4);
  expect(onSelect).toHaveBeenCalledWith(4);
});

test('renders nothing when closed', () => {
  const { container } = render(
    <HoleJumpDialog
      isOpen={false}
      onClose={() => {}}
      holes={[1, 2, 3]}
      completedHoles={[]}
      currentHole={0}
      onSelect={() => {}}
      t={t}
      pars={{}}
    />
  );
  expect(container.firstChild).toBeNull(); // eslint-disable-line testing-library/no-node-access
});
