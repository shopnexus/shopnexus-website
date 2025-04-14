import { type TErrorResponse } from "./error/error.type";

// import { env } from './env';
// console.log(process.env.NEXT_PUBLIC_API_URLs)

// const baseUrl = addTrailingSlash(
// 	resolve(
// 		addTrailingSlash(process.env.NEXT_PUBLIC_API_URL!),
// 		process.env.NEXT_PUBLIC_API_VERSION!
// 	)
// )

const baseUrl = "http://khoakomlem-internal.ddns.net:8080/api/";

const headers: HeadersInit = {
  "Content-Type": "application/json",
};

// if (process.env.NODE_ENV === "development") {
// headers.Authorization = `Bearer ${env.NEXT_PUBLIC_API_TEST_TOKEN}`;
headers.Authorization = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJyb2xlIjoiQURNSU4iLCJpc3MiOiJzaG9wbmV4dXMiLCJzdWIiOiIxIiwiYXVkIjpbInNob3BuZXh1cyJdLCJleHAiOjE3NDExMDg0MzQsImlhdCI6MTc0MTAyMjAzNH0.q9bS6PlhIr2Bp0puOzE1O_gCkNq0rElIoX0I-zfw7U4`;
// }

// Helper function to resolve URLs
function resolveUrl(base: string, path: string): string {
  return new URL(path, base).toString();
}

export async function customFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const resolvedUrl = resolveUrl(baseUrl, url);
  const response = await fetch(resolvedUrl, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });
  if (!response.ok) {
    if (response.status === 500) {
      const res = (await response.json()) as TErrorResponse;
      throw new Error(res.message);
    }

    throw new Error(
      `HTTP error! Status: ${response.status}, Status Text: ${response.statusText}`
    );
  }

  return response;
}

export async function customFetchJson<SuccessResponse = any>(
  url: string,
  options: RequestInit = {}
): Promise<SuccessResponse> {
  const resolvedUrl = resolveUrl(baseUrl, url);
  return customFetch(resolvedUrl, options).then(async (res) =>
    res.json()
  ) as Promise<SuccessResponse>;
}
