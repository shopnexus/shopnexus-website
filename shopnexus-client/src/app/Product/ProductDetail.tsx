import { useParams } from "react-router-dom";

export default function ProductDetail() {
  const { id } = useParams(); // Lấy id từ URL

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold bg-amber-200">Product Detail - ID: {id}</h1>
      <p>Here is the product detail for product ID: {id}</p>
      <img src="/placeholder2.jpeg" alt="" />
    </div>
  );
}
