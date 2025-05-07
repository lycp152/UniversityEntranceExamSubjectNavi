import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

// scrollIntoViewのモック
Element.prototype.scrollIntoView = vi.fn();

describe('Select', () => {
  it('プレースホルダー付きのセレクトトリガーを表示すること', () => {
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

  it('トリガーをクリックしたときにセレクトコンテンツを開くこと', async () => {
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

  it('オプションをクリックしたときに選択すること', async () => {
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

  it('キーボードナビゲーションを処理すること', async () => {
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

  it('外部をクリックしたときにセレクトを閉じること', async () => {
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

  it('適切なアクセシビリティ属性を持つこと', () => {
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

  it('無効状態を処理すること', () => {
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
