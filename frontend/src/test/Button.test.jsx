import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Button from '../components/shared/Button';

describe('Button component', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when isDisabled prop is true', () => {
    render(<Button isDisabled={true}>Click me</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('shows loading spinner when isLoading is true', () => {
    render(<Button isLoading={true}>Click me</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    // Check if the loading svg exists
    const svg = button.querySelector('svg');
    expect(svg).toHaveClass('animate-spin');
  });

  it('applies correct variant styles', () => {
    render(<Button variant="primary">Primary</Button>);
    const button = screen.getByText('Primary');
    expect(button).toHaveClass('bg-red-600');
  });
});
