import { useCallback, useEffect, useRef } from 'react';

const focusCell = (cells: NodeListOf<Element>, index: number) => {
  if (index >= 0 && index < cells.length) {
    const cell = cells[index] as HTMLElement;
    if (
      cell &&
      (cell.getAttribute('role') === 'gridcell' ||
        cell.getAttribute('role') === 'columnheader' ||
        cell.tagName.toLowerCase() === 'th' ||
        cell.tagName.toLowerCase() === 'td')
    ) {
      cell.focus();
      return true;
    }
  }
  return false;
};

const getRowBoundaries = (cells: NodeListOf<Element>, currentIndex: number) => {
  const rowSize = 4; // 1行あたりのセル数
  const currentRow = Math.floor(currentIndex / rowSize);
  const rowStart = currentRow * rowSize;
  const rowEnd = rowStart + rowSize - 1;
  return { rowStart, rowEnd, rowSize };
};

const handleRowNavigation = (
  cells: NodeListOf<Element>,
  currentIndex: number,
  direction: 'left' | 'right'
) => {
  const { rowStart, rowEnd } = getRowBoundaries(cells, currentIndex);
  let nextIndex = currentIndex;

  if (direction === 'right' && currentIndex < rowEnd) {
    nextIndex = currentIndex + 1;
  } else if (direction === 'left' && currentIndex > rowStart) {
    nextIndex = currentIndex - 1;
  }

  return focusCell(cells, nextIndex);
};

const handleColumnNavigation = (
  cells: NodeListOf<Element>,
  currentIndex: number,
  direction: 'up' | 'down'
) => {
  const { rowSize } = getRowBoundaries(cells, currentIndex);
  let nextIndex = currentIndex;

  if (direction === 'down' && currentIndex + rowSize < cells.length) {
    nextIndex = currentIndex + rowSize;
  } else if (direction === 'up' && currentIndex - rowSize >= 0) {
    nextIndex = currentIndex - rowSize;
  }

  return focusCell(cells, nextIndex);
};

const handleRowHomeEnd = (cells: NodeListOf<Element>, currentIndex: number, isEnd: boolean) => {
  const { rowStart, rowEnd } = getRowBoundaries(cells, currentIndex);
  return focusCell(cells, isEnd ? rowEnd : rowStart);
};

export const useTableKeyboardNavigation = () => {
  const tableRef = useRef<HTMLTableElement>(null);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const table = tableRef.current;
    if (!table) return;

    const cells = table.querySelectorAll('th, td');
    const currentCell = document.activeElement;
    if (!currentCell || !cells.length) return;

    const currentIndex = Array.from(cells).indexOf(currentCell);
    if (currentIndex === -1) return;

    let handled = false;

    switch (event.key) {
      case 'ArrowRight':
        handled = handleRowNavigation(cells, currentIndex, 'right');
        break;
      case 'ArrowLeft':
        handled = handleRowNavigation(cells, currentIndex, 'left');
        break;
      case 'ArrowDown':
        handled = handleColumnNavigation(cells, currentIndex, 'down');
        break;
      case 'ArrowUp':
        handled = handleColumnNavigation(cells, currentIndex, 'up');
        break;
      case 'Home':
        if (event.ctrlKey) {
          handled = focusCell(cells, 0);
        } else {
          handled = handleRowHomeEnd(cells, currentIndex, false);
        }
        break;
      case 'End':
        if (event.ctrlKey) {
          handled = focusCell(cells, cells.length - 1);
        } else {
          handled = handleRowHomeEnd(cells, currentIndex, true);
        }
        break;
    }

    if (handled) {
      event.preventDefault();
    }
  }, []);

  useEffect(() => {
    const table = tableRef.current;
    if (!table) return;

    table.addEventListener('keydown', handleKeyDown);
    return () => {
      table.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return tableRef;
};
