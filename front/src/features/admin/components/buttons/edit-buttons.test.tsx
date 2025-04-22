import { render, screen, fireEvent } from '@testing-library/react';
import { EditButtons, SaveButton, CancelButton } from './edit-buttons';
import { describe, it, expect, vi } from 'vitest';

describe('EditButtons', () => {
  it('編集モードでない場合、編集ボタンのみが表示される', () => {
    const onEdit = vi.fn();
    render(<EditButtons isEditing={false} onEdit={onEdit} onSave={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByRole('button', { name: /編集/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /保存/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /キャンセル/i })).not.toBeInTheDocument();
  });

  it('編集モードの場合、保存ボタンとキャンセルボタンが表示される', () => {
    render(<EditButtons isEditing={true} onEdit={vi.fn()} onSave={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByRole('button', { name: /保存/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /キャンセル/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /編集/i })).not.toBeInTheDocument();
  });

  it('編集ボタンをクリックするとonEditが呼ばれる', () => {
    const onEdit = vi.fn();
    render(<EditButtons isEditing={false} onEdit={onEdit} onSave={vi.fn()} onCancel={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /編集/i }));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });
});

describe('SaveButton', () => {
  it('クリック時に確認ダイアログが表示され、OKを押すとonSaveが呼ばれる', () => {
    const onSave = vi.fn();
    window.confirm = vi.fn(() => true);

    render(<SaveButton onSave={onSave} />);
    fireEvent.click(screen.getByRole('button', { name: /保存/i }));

    expect(window.confirm).toHaveBeenCalledWith('変更を保存しますか？');
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('確認ダイアログでキャンセルを押すとonSaveが呼ばれない', () => {
    const onSave = vi.fn();
    window.confirm = vi.fn(() => false);

    render(<SaveButton onSave={onSave} />);
    fireEvent.click(screen.getByRole('button', { name: /保存/i }));

    expect(onSave).not.toHaveBeenCalled();
  });
});

describe('CancelButton', () => {
  it('クリック時に確認ダイアログが表示され、OKを押すとonCancelが呼ばれる', () => {
    const onCancel = vi.fn();
    window.confirm = vi.fn(() => true);

    render(<CancelButton onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button', { name: /キャンセル/i }));

    expect(window.confirm).toHaveBeenCalledWith('変更は破棄されますが、よろしいですか？');
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('確認ダイアログでキャンセルを押すとonCancelが呼ばれない', () => {
    const onCancel = vi.fn();
    window.confirm = vi.fn(() => false);

    render(<CancelButton onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button', { name: /キャンセル/i }));

    expect(onCancel).not.toHaveBeenCalled();
  });
});
