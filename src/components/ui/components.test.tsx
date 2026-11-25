import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from './Button';
import { Toggle } from './Toggle';

describe('Button', () => {
  it('memanggil onClick saat ditekan', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Simpan</Button>);

    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('nonaktif saat isLoading dan menandai aria-busy', () => {
    render(<Button isLoading>Simpan</Button>);
    const button = screen.getByRole('button', { name: 'Simpan' });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });
});

describe('Toggle', () => {
  it('melaporkan perubahan status', async () => {
    const onChange = vi.fn();
    render(<Toggle checked={false} onChange={onChange} label="Alarm" />);

    await userEvent.click(screen.getByRole('switch', { name: 'Alarm' }));

    expect(onChange).toHaveBeenCalledWith(true);
  });
});
