import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from './input';

describe('Input', () => {
  it('should render input element with default props', () => {
    render(<Input data-testid="test-input" />);
    const input = screen.getByTestId('test-input');
    expect(input).toBeInTheDocument();
    expect(input).not.toHaveAttribute('type');
  });

  it('should apply custom className', () => {
    const customClass = 'custom-class';
    render(<Input data-testid="test-input" className={customClass} />);
    const input = screen.getByTestId('test-input');
    expect(input).toHaveClass(customClass);
  });

  it('should handle different input types', () => {
    render(<Input data-testid="test-input" type="password" />);
    const input = screen.getByTestId('test-input');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('should pass through additional props', () => {
    render(<Input data-testid="test-input" placeholder="Enter text" disabled />);
    const input = screen.getByTestId('test-input');
    expect(input).toHaveAttribute('placeholder', 'Enter text');
    expect(input).toBeDisabled();
  });
});
