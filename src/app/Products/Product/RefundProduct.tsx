import { useState } from "react";
import { Camera } from "lucide-react";

export interface RefundInfo {
  //thong tin tra hang
  id: string;
  paymentId: string,
  method: string;
  status: string;
  reason: string;
  dateCreated: string;
  dateUpdated: string;
  resources: string[];
}

//test data
const dataModel : RefundInfo = {
            id: "2",
            paymentId: "3",
            method: "REFUND_METHOD_DROP_OFF",
            status: "STATUS_SUCCESS",
            reason: "Sub comedo voluptates uredo deorsum universe peior carus aestas adipisci.",
            dateCreated: "1743808940828",
            dateUpdated: "1743808940828",
            resources: [
                "https://loremflickr.com/800/600?lock=3346652999366532",
                "https://picsum.photos/seed/alIPKkY4Vp/800/600?grayscale&blur=8",
                "https://picsum.photos/seed/b0yMS3yqA/800/600?blur=1",
                "https://picsum.photos/seed/FqcOQm4uhU/800/600?blur=3",
                "https://picsum.photos/seed/U6WUuEL1/800/600?grayscale",
                "https://picsum.photos/seed/v1iD8SXxS/800/600?blur=5",
                "https://picsum.photos/seed/Wtws7H3Ft/800/600?grayscale&blur=9",
                "https://picsum.photos/seed/X8XFwhkQ/800/600?blur=7"
            ]
}
const RefundProduct: React.FC = () => {
  const [formData, setFormData] = useState({
    idRefund: "",
    selectedReason: "",
    customReason: "",
    productImages: [] as File[], // nhiều ảnh
    productImagePreviews: [] as string[], // base64 preview
  });
  const [message, setMessage] = useState("");

  const product = {
    name: "Sản phẩm A",
    price: 500000,
    image: "https://via.placeholder.com/150",
  };

  const refundAmount = product.price * 0.9;

  const reasons = [
    "Sản phẩm bị lỗi",
    "Không đúng mô tả",
    "Giao sai hàng",
    "Thiếu phụ kiện",
    "Khác (Nhập lý do cụ thể)",
  ];

  const pays = ["Ví VNPay", "Tiền mặt", "Ví Momo"];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTimeout(() => {
      setMessage("Yêu cầu hoàn trả hàng đã được gửi thành công!");
    }, 1000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const previews: string[] = [];
  
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result as string);
        if (previews.length === files.length) {
          setFormData((prev) => ({
            ...prev,
            productImages: [...prev.productImages, ...files],
            productImagePreviews: [...prev.productImagePreviews, ...previews],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };
  
  

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-md mt-6 border border-gray-200">
      <h2 className="text-lg font-semibold mb-3 text-gray-900">Yêu cầu hoàn trả hàng</h2>
      {message && <p className="text-green-600 font-semibold mb-2">{message}</p>}

      {/* Thông tin sản phẩm */}
      <div className="bg-gray-100 p-3 rounded-lg mb-4">
        <div className="flex items-center gap-3">
          <img
            src={product.image}
            alt={product.name}
            className="w-16 h-16 object-cover border rounded-md"
          />
          <div>
            <p className="font-medium text-gray-800">{product.name}</p>
            <p className="text-sm text-gray-600">Giá: {product.price.toLocaleString()} VNĐ</p>
          </div>
        </div>
      </div>

      {/* Thông tin hoàn tiền */}
      <div className="bg-gray-100 p-3 rounded-lg mb-4">
        <p className="text-sm text-gray-700">Số tiền hoàn lại:</p>
        <p className="text-lg text-red-500 font-semibold">{refundAmount.toLocaleString()} VNĐ</p>
      </div>

      {/* Phương thức hoàn trả */}
      <div className="bg-gray-100 p-3 rounded-lg mb-4">
        <p className="text-sm text-gray-700 font-medium">Phương thức hoàn trả</p>
        <select className="w-full p-2 border rounded-md bg-gray-50 cursor-pointer">
          <option value="">--Chọn phương thức--</option>
          {pays.map((pay, index) => (
            <option key={index} value={pay}>
              {pay}
            </option>
          ))}
        </select>
      </div>

      {/* Lý do hoàn trả + Upload ảnh lỗi */}
      <div className="bg-gray-100 p-3 rounded-lg">
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Lý do hoàn trả</label>
          <select
            name="selectedReason"
            value={formData.selectedReason}
            onChange={handleChange}
            className={`cursor-pointer w-full p-2 border rounded-md ${
              formData.selectedReason ? "bg-gray-200 border-black-500" : "bg-gray-50"
            }`}
            required
          >
            <option value="">--Chọn lý do-- </option>
            {reasons.map((reason, index) => (
              <option key={index} value={reason}>
                {reason}
              </option>
            ))}
          </select>

          {formData.selectedReason === "Khác (Nhập lý do cụ thể)" && (
            <textarea
              name="customReason"
              value={formData.customReason}
              onChange={handleChange}
              placeholder="Nhập lý do cụ thể"
              required
              className="w-full p-2 border rounded-md bg-gray-50"
            />
          )}

          {/* Upload ảnh sản phẩm lỗi */}
          <div>
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ảnh sản phẩm lỗi
            </label>
            <div className="grid grid-cols-3 gap-2">
              {formData.productImagePreviews.map((imgSrc, index) => (
                <img
                  key={index}
                  src={imgSrc}
                  alt={`preview-${index}`}
                  className="w-full h-24 object-cover border rounded-md"
                />
              ))}

              {/* Ô thêm ảnh mới */}
              <label
                htmlFor="addMoreImage"
                className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-400 rounded-md cursor-pointer hover:bg-gray-100"
              >
                <span className="text-2xl text-gray-500">➕</span>
                <input
                  id="addMoreImage"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
      </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded-md font-medium hover:bg-blue-600 cursor-pointer"
          >
            Gửi yêu cầu
          </button>
        </form>
      </div>
    </div>
  );
};

export default RefundProduct;
