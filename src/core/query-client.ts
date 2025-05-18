import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { createConnectTransport } from "@connectrpc/connect-web";

const CONNECT_UNAUTHORIZED_ERROR_CODE = 16;

export const BASE_URL = "http://wagecloud.ddns.net:50051";
// export const BASE_URL = "http://localhost:50051";

function handleUnAuthorized(error: any) {
  if (
    error.code === CONNECT_UNAUTHORIZED_ERROR_CODE &&
    window.location.pathname != "/login" &&
    window.location.pathname != "/admin-login"
  ) {
    if (window.location.pathname.includes("/admin")) {
      location.href = "/admin-login";
    }
  }
}

function handleUnAuthorizedMutation(error: any) {
  if (
    error.code === CONNECT_UNAUTHORIZED_ERROR_CODE &&
    window.location.pathname != "/login" &&
    window.location.pathname != "/admin-login"
  ) {
    if (window.location.pathname.includes("/admin")) {
      location.href = "/admin-login";
    } else {
      location.href = "/login";
    }
  }
}

export const finalTransport = createConnectTransport({
  baseUrl: BASE_URL,
  useBinaryFormat: false,
  useHttpGet: true,
  interceptors: [
    (next) => (request) => {
      const token = localStorage.getItem("token");
      if (token) {
        request.header.append(
          "authorization",
          "Bearer " + localStorage.getItem("token")
        );
      }

      return next(request);
    },
  ],
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: true,
    },
  },
  queryCache: new QueryCache({
    onError(error) {
      handleUnAuthorized(error);
    },
  }),
  mutationCache: new MutationCache({
    onError(error) {
      handleUnAuthorizedMutation(error);
    },
  }),
});
