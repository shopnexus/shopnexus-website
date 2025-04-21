import { useQuery } from "@connectrpc/connect-query";
import { getProduct, getProductModel } from "shopnexus-protobuf-gen-ts";
import { ProductOnPayment } from "shopnexus-protobuf-gen-ts/pb/payment/v1/payment_pb";

interface PurchaseHistoryItemProps {
  item: ProductOnPayment;
}

export const PurchaseHistoryItem: React.FC<PurchaseHistoryItemProps> = ({
  item,
}) => {
  const { data: productResponse } = useQuery(getProduct, {
    id: item.itemQuantity?.itemId,
  });
  const product = productResponse?.data;

  const { data: productModelResponse } = useQuery(getProductModel, {
    id: product?.productModelId,
  });
  const productModel = productModelResponse?.data;

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-4 pb-4 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
      <div className="md:w-28 md:h-28 w-full h-48 flex-shrink-0">
        <img
          src={product?.resources[0]}
          alt={productModel?.name}
          className="w-full h-full object-cover rounded-lg border border-gray-200"
        />
      </div>

      <div className="flex-1">
        <h3 className="text-lg font-medium text-gray-800">
          {productModel?.name}
        </h3>
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
          {productModel?.description}
        </p>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <p className="text-gray-700">
            Quantity:{" "}
            <span className="font-medium">
              {item.itemQuantity?.quantity.toString()}
            </span>
          </p>
          <p className="text-gray-700">
            Unit price:{" "}
            <span className="text-blue-600 font-medium">
              {parseInt(item.price.toString()).toLocaleString()} ₫
            </span>
          </p>
          <p className="col-span-2 mt-1">
            <span className="text-gray-700">Total:</span>{" "}
            <span className="text-red-600 font-semibold">
              {parseInt(item.totalPrice.toString()).toLocaleString()} ₫
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
