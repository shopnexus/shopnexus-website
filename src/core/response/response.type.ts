/* eslint-disable @typescript-eslint/no-explicit-any */
export type SuccessRes<Data = any> = {
	success: true
	data: Data
}

export type SuccessPaginationRes<Item> = SuccessRes<Item[]> & {
	pagination: {
		total: number
		page: number
		limit: number
	}
}
