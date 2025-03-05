import { useCallback } from "react";
import { useRouter } from "next/router";
import {
  ApiClientError,
  NetworkError,
  TimeoutError,
} from "@/api/client/errors";
import { isAPIError } from "@/lib/errors/api";

export const useErrorHandler = () => {
  const router = useRouter();

  const handleRouting = useCallback(
    (message: string, path: string) => {
      console.error(message);
      router.push({ pathname: path, query: { error: message } });
    },
    [router]
  );

  const handleError = useCallback(
    (error: unknown) => {
      // APIエラーの処理
      if (isAPIError(error)) {
        const message = `API Error (${error.code}): ${error.message}`;
        console.error(message);
        handleRouting(message, "/error");
        return error.message;
      }

      // クライアントAPIエラーの処理
      if (ApiClientError.isApiClientError(error)) {
        switch (error.code) {
          case "UNAUTHORIZED":
            handleRouting("ログインが必要です", "/login");
            break;
          case "FORBIDDEN":
            handleRouting("アクセス権限がありません", "/403");
            break;
          case "NOT_FOUND":
            handleRouting("リソースが見つかりません", "/404");
            break;
          default:
            handleRouting("予期せぬエラーが発生しました", "/error");
            break;
        }
        return error.message;
      }

      // ネットワークエラーの処理
      if (error instanceof NetworkError) {
        handleRouting("ネットワークに接続できません", "/offline");
        return "ネットワークエラー";
      }

      // タイムアウトエラーの処理
      if (error instanceof TimeoutError) {
        handleRouting("接続がタイムアウトしました", "/error");
        return "タイムアウト";
      }

      // 一般的なエラーの処理
      if (error instanceof Error) {
        console.error("Application Error:", error);
        handleRouting(error.message, "/error");
        return error.message;
      }

      // 未知のエラー
      console.error("Unknown Error:", error);
      handleRouting("システムエラーが発生しました", "/error");
      return "予期せぬエラーが発生しました";
    },
    [handleRouting]
  );

  return { handleError };
};
