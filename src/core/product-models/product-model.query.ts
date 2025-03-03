import { genQueryCrud } from "../gen-query-crud"
import { TProductModel } from "./product-model.type"

export const {
	create: useCreateProductModel,
	list: useListProductModel,
	read: useReadProductModel,
	patch: usePatchProductModel,
	delete: useDeleteProductModel,
} = genQueryCrud<TProductModel>("products/models")
