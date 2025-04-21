import { describe, it, expect } from 'vitest';
import { renderWithProviders } from './render-utils';
import { screen } from '@testing-library/react';

/**
 * レンダリングユーティリティのテスト
 * @description
 * - コンポーネントのレンダリングを検証
 * - オプションの適用を確認
 * - 型の整合性を検証
 */
describe('render-utils', () => {
  describe('renderWithProviders', () => {
    it('コンポーネントを正しくレンダリングする', () => {
      const TestComponent = () => <div data-testid="test">Test</div>;
      const { getByTestId } = renderWithProviders(<TestComponent />);
      expect(getByTestId('test')).toBeInTheDocument();
      expect(getByTestId('test')).toHaveTextContent('Test');
    });

    it('オプションを正しく適用する', () => {
      const TestComponent = () => <div>Test</div>;
      const options = { container: document.createElement('div') };
      const { container } = renderWithProviders(<TestComponent />, options);
      expect(container).toBe(options.container);
    });

    it('複数のコンポーネントを正しくレンダリングする', () => {
      const TestComponent1 = () => <div data-testid="test1">Test1</div>;
      const TestComponent2 = () => <div data-testid="test2">Test2</div>;

      renderWithProviders(
        <>
          <TestComponent1 />
          <TestComponent2 />
        </>
      );

      expect(screen.getByTestId('test1')).toBeInTheDocument();
      expect(screen.getByTestId('test2')).toBeInTheDocument();
    });
  });
});
