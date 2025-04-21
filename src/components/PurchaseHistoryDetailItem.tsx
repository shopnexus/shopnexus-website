import { useQuery } from "@connectrpc/connect-query";
import { getProduct, getProductModel } from "shopnexus-protobuf-gen-ts";
import { ProductOnPayment } from "shopnexus-protobuf-gen-ts/pb/payment/v1/payment_pb";
import { useNavigate } from "react-router-dom";

interface PurchaseHistoryDetailItemProps {
  item: ProductOnPayment;
  paymentId: bigint;
  onClose?: () => void;
}

export const PurchaseHistoryDetailItem: React.FC<
  PurchaseHistoryDetailItemProps
> = ({ item, paymentId, onClose }) => {
  const navigate = useNavigate();

  const handleReturn = () => {
    navigate(
      `/refund?id=${paymentId.toString()}&product_id=${item.itemQuantity?.itemId.toString()}`
    );
    onClose?.();
  };

  const { data: productResponse } = useQuery(getProduct, {
    id: item.itemQuantity?.itemId,
  });
  const product = productResponse?.data;
  const { data: productModelResponse } = useQuery(getProductModel, {
    id: product?.productModelId,
  });
  const productModel = productModelResponse?.data;

  if (!product) return null;

  return (
    <div className="flex gap-4 rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors">
      <img
        src={product.resources[0] || "/default-product.png"}
        alt={productModel?.name}
        className="w-24 h-24 object-cover rounded-md border border-gray-200 flex-shrink-0"
      />
      <div className="flex-1">
        <h4 className="text-lg font-medium text-gray-800">
          {productModel?.name}
        </h4>
        <p className="text-sm text-gray-600 mb-2">
          {productModel?.description}
        </p>

        <div className="grid grid-cols-2 gap-x-4 text-sm">
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

          {item.serialIds.length > 0 && (
            <div className="col-span-2 mt-2">
              <p className="text-gray-700 font-medium mb-1">Mã serial:</p>
              <div className="flex flex-wrap gap-2">
                {item.serialIds.map((serial, i) => (
                  <span
                    key={i}
                    className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
                  >
                    {serial}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="ml-auto flex flex-col items-end gap-2">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-500">Total</p>
          <p className="text-lg font-semibold text-red-600">
            {parseInt(item.totalPrice.toString()).toLocaleString()} ₫
          </p>
        </div>
        <button
          onClick={handleReturn}
          className="cursor-pointer bg-red-500 hover:bg-red-600 text-white text-sm py-2 px-4 rounded-lg shadow-sm transition-all duration-200 flex items-center"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z"
            ></path>
          </svg>
          Return/ Refund
        </button>
      </div>
    </div>
  );
};
