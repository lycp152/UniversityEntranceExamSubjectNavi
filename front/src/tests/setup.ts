import "@testing-library/jest-dom";
import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

// Vitestのexpectを拡張
expect.extend(matchers);

// 各テスト後にクリーンアップを実行
afterEach(() => {
  cleanup();
});
