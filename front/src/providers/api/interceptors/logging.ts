import type { RequestConfig } from "@/providers/api/client/types";
import { isDevelopment } from "@/config/environment";

export class LoggingInterceptor {
  async interceptRequest(config: RequestConfig): Promise<RequestConfig> {
    if (isDevelopment) {
      console.group("API Request");
      console.log("Method:", config.method);
      console.log("Headers:", config.headers);
      console.log("Body:", config.body);
      console.groupEnd();
    }
    return config;
  }

  async interceptResponse(response: Response): Promise<Response> {
    if (isDevelopment) {
      console.group("API Response");
      console.log("Status:", response.status);
      console.log("Headers:", response.headers);
      const clonedResponse = response.clone();
      const body = await clonedResponse.json().catch(() => undefined);
      console.log("Body:", body);
      console.groupEnd();
    }
    return response;
  }
}

export const loggingRequestInterceptor =
  new LoggingInterceptor().interceptRequest.bind(new LoggingInterceptor());
export const loggingResponseInterceptor =
  new LoggingInterceptor().interceptResponse.bind(new LoggingInterceptor());
