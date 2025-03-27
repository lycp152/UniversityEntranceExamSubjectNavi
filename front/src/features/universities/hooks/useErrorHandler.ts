import { useCallback } from "react";
import { useRouter } from "next/router";
import { BaseApiError } from "@/lib/api/errors/base";
import { API_ERROR_CODES } from "@/constants/domain-error-codes";

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
      // APIエラーの処理（BaseApiErrorを継承したすべてのエラー）
      if (error instanceof BaseApiError) {
        switch (error.code) {
          case API_ERROR_CODES.UNAUTHORIZED:
            handleRouting("ログインが必要です", "/login");
            break;
          case API_ERROR_CODES.FORBIDDEN:
            handleRouting("アクセス権限がありません", "/403");
            break;
          case API_ERROR_CODES.NOT_FOUND:
            handleRouting("リソースが見つかりません", "/404");
            break;
          case API_ERROR_CODES.NETWORK_ERROR:
            handleRouting("ネットワークに接続できません", "/offline");
            break;
          case API_ERROR_CODES.TIMEOUT_ERROR:
            handleRouting("接続がタイムアウトしました", "/error");
            break;
          default:
            handleRouting("予期せぬエラーが発生しました", "/error");
            break;
        }
        return error.message;
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
