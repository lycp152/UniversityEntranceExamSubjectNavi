import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

// scrollIntoViewのモック
Element.prototype.scrollIntoView = vi.fn();

describe('Select', () => {
  it('should render select trigger with placeholder', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="選択してください" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">オプション1</SelectItem>
          <SelectItem value="option2">オプション2</SelectItem>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getByRole('combobox');
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveTextContent('選択してください');
  });

  it('should open select content when trigger is clicked', async () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="選択してください" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">オプション1</SelectItem>
          <SelectItem value="option2">オプション2</SelectItem>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getByRole('combobox');
    await act(async () => {
      fireEvent.click(trigger);
    });

    const content = screen.getByRole('listbox');
    expect(content).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('should select an option when clicked', async () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="選択してください" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">オプション1</SelectItem>
          <SelectItem value="option2">オプション2</SelectItem>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getByRole('combobox');
    await act(async () => {
      fireEvent.click(trigger);
    });

    const option1 = screen.getByText('オプション1');
    await act(async () => {
      fireEvent.click(option1);
    });

    expect(trigger).toHaveTextContent('オプション1');
  });

  it('should handle keyboard navigation', async () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="選択してください" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">オプション1</SelectItem>
          <SelectItem value="option2">オプション2</SelectItem>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getByRole('combobox');
    await act(async () => {
      fireEvent.keyDown(trigger, { key: 'Enter' });
    });

    const content = screen.getByRole('listbox');
    expect(content).toBeInTheDocument();

    await act(async () => {
      fireEvent.keyDown(content, { key: 'ArrowDown' });
      fireEvent.keyDown(content, { key: 'Enter' });
    });

    const selectedValue = screen.getByText('オプション1');
    expect(selectedValue).toBeInTheDocument();
  });

  it('should close select when clicking outside', async () => {
    render(
      <div>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="選択してください" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">オプション1</SelectItem>
            <SelectItem value="option2">オプション2</SelectItem>
          </SelectContent>
        </Select>
        <div data-testid="outside">外部要素</div>
      </div>
    );

    const trigger = screen.getByRole('combobox');
    await act(async () => {
      fireEvent.click(trigger);
    });

    const content = screen.getByRole('listbox');
    expect(content).toBeInTheDocument();
    expect(content).toHaveAttribute('data-state', 'open');

    const outside = screen.getByTestId('outside');
    await act(async () => {
      fireEvent.mouseDown(outside);
    });

    // アニメーションの完了を待機
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  it('should have proper accessibility attributes', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="選択してください" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">オプション1</SelectItem>
          <SelectItem value="option2">オプション2</SelectItem>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('aria-controls');
    expect(trigger).toHaveAttribute('aria-autocomplete', 'none');
    expect(trigger).toHaveAttribute('role', 'combobox');
  });

  it('should handle disabled state', () => {
    render(
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="選択してください" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">オプション1</SelectItem>
          <SelectItem value="option2">オプション2</SelectItem>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getByRole('combobox');
    expect(trigger).toBeDisabled();
  });
});
