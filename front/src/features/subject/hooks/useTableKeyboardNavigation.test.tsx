import { renderHook } from '@testing-library/react';
import { useTableKeyboardNavigation } from './useTableKeyboardNavigation';
import { fireEvent } from '@testing-library/dom';
import { vi } from 'vitest';

type TableCell = HTMLTableCellElement;

interface TestSetup {
  table: HTMLTableElement;
  cells: TableCell[];
}

const TEST_DATA = {
  HEADERS: ['科目名', '共通テスト', '個別試験', '合計'],
  ROW_DATA: ['英語', '80', '90', '170'],
  CELL_COUNT: 8,
} as const;

const KEYS = {
  ARROW_RIGHT: 'ArrowRight',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_DOWN: 'ArrowDown',
  ARROW_UP: 'ArrowUp',
  HOME: 'Home',
  END: 'End',
} as const;

describe('useTableKeyboardNavigation', () => {
  const setupTest = (): TestSetup => {
    const table = setupTable();
    const { result } = renderHook(() => useTableKeyboardNavigation());

    if (!table) {
      throw new Error('テーブルの初期化に失敗しました');
    }

    Object.defineProperty(result.current, 'current', { value: table, writable: true });
    const cells = Array.from(table.querySelectorAll<TableCell>('th, td'));

    if (cells.length !== TEST_DATA.CELL_COUNT) {
      throw new Error('予期しないセル数です');
    }

    return { table, cells };
  };

  const setupTable = () => {
    document.body.innerHTML = `
      <table role="grid" aria-label="科目別スコア表">
        <thead>
          <tr role="row">
            ${TEST_DATA.HEADERS.map(
              (header, index) =>
                `<th role="columnheader" scope="col" tabindex="0" data-index="${index}">${header}</th>`
            ).join('')}
          </tr>
        </thead>
        <tbody>
          <tr role="row">
            ${TEST_DATA.ROW_DATA.map(
              (cell, index) =>
                `<td role="gridcell" ${
                  index === 0 ? 'scope="row"' : ''
                } tabindex="0" data-index="${index + TEST_DATA.HEADERS.length}">${cell}</td>`
            ).join('')}
          </tr>
        </tbody>
      </table>
    `;
    return document.querySelector('table');
  };

  const pressKey = (table: HTMLTableElement, key: keyof typeof KEYS, ctrlKey = false) => {
    fireEvent.keyDown(table, { key: KEYS[key], ctrlKey });
  };

  const expectFocusedCell = (cells: TableCell[], index: number) => {
    const cell = cells[index];
    cell.focus();
    expect(document.activeElement).toBe(cell);
    expect(document.activeElement?.textContent).toBe(
      index < TEST_DATA.HEADERS.length
        ? TEST_DATA.HEADERS[index]
        : TEST_DATA.ROW_DATA[index - TEST_DATA.HEADERS.length]
    );
  };

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  it('矢印キーで正しくフォーカスが移動すること', () => {
    const { table, cells } = setupTest();

    // 最初のセルにフォーカスを設定
    expectFocusedCell(cells, 0);

    // 右に移動
    pressKey(table, 'ARROW_RIGHT');
    expectFocusedCell(cells, 1);

    // 左に移動
    pressKey(table, 'ARROW_LEFT');
    expectFocusedCell(cells, 0);

    // 下に移動
    pressKey(table, 'ARROW_DOWN');
    expectFocusedCell(cells, 4);

    // 上に移動
    pressKey(table, 'ARROW_UP');
    expectFocusedCell(cells, 0);
  });

  it('Home/Endキーで正しくフォーカスが移動すること', () => {
    const { table, cells } = setupTest();

    // 最初のセルにフォーカスを設定
    expectFocusedCell(cells, 0);

    // 行の最後に移動
    pressKey(table, 'END');
    expectFocusedCell(cells, 3);

    // 行の最初に移動
    pressKey(table, 'HOME');
    expectFocusedCell(cells, 0);

    // テーブルの最後に移動（Ctrl + End）
    pressKey(table, 'END', true);
    expectFocusedCell(cells, 7);

    // テーブルの最初に移動（Ctrl + Home）
    pressKey(table, 'HOME', true);
    expectFocusedCell(cells, 0);
  });

  it('テーブルの境界を超えないこと', () => {
    const { table, cells } = setupTest();

    // 最初のセルにフォーカスを設定
    expectFocusedCell(cells, 0);

    // 左端で左に移動しようとする
    pressKey(table, 'ARROW_LEFT');
    expectFocusedCell(cells, 0);

    // 最後のセルにフォーカスを設定
    expectFocusedCell(cells, cells.length - 1);

    // 右端で右に移動しようとする
    pressKey(table, 'ARROW_RIGHT');
    expectFocusedCell(cells, cells.length - 1);
  });
});
