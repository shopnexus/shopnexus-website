/* eslint-disable @typescript-eslint/no-explicit-any */
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query"

// import { env } from './env';
// TODO: sua lai cho nay

function handleUnAuthorized(error: any) {
	console.error(error)
	// If (window.location.pathname.split('/')[1] === 'share') return;
	// If (isServerError(error, 'ErrWrongAuthHeader')) {
	//   location.href = '/login';
	//   console.log('redirect to login');
	//   // !!! có thể có loop ở đây vì nếu chuyển hướng vô /login mà cookie ko đc set thì sẽ lại chuyển hướng vô /login lần nữa
	// }
}

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
			handleUnAuthorized(error)
		},
	}),
	mutationCache: new MutationCache({
		onError(error) {
			handleUnAuthorized(error)
		},
	}),
})
