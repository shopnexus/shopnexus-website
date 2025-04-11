import { Trash2 } from "lucide-react"
import Button from "../../components/ui/Button"
import Input from "../../components/ui/Input"
import { ProductModelEntity } from "shopnexus-protobuf-gen-ts";

export interface ItemInCart {
  id: number; 
  name: string;
  price: number;
  quantity: number;
  image: string;
  variantId: number; 
  color: string;
  size: number;
  stockQuantity:number
}
interface CartItemProps {
  item: ProductModelEntity|undefined
  selected: boolean
  onSelect: ()=>void
  onRemove: () => void
  onUpdateQuantity: (newQuantity: number) => void
}

export default function CartItem({ item,selected=false,onSelect=()=>{}, onRemove, onUpdateQuantity }: CartItemProps) {
  if (!item) {
    return <div>Loading...</div>; // Hoặc có thể là một thông báo khác nếu item chưa có
  }
  return (  
    <div className="flex items-center py-6 border-b">
      <input type="checkbox" checked={selected} onChange={onSelect} className="mr-4 w-5 h-5" />
      <img src={item.image || "/placeholder.svg"} alt={item.name} width={100} height={100} className="rounded-md" />
      <div className="ml-4 flex-grow">
        <h3 className="text-lg font-medium">{item.name}</h3>
        <p className="text-gray-600">${item.price.toFixed(2)}</p>
        <div className="mt-2 flex items-center">
          <Input
            type="number"
            min="1"
            max={item.stockQuantity}
            value={String(item.quantity)}
            onChange={(e) => onUpdateQuantity(Number.parseInt(e.target.value))}
            className="w-20 text-center mr-4"
          />
          <Button variant="outline" size="sm" onClick={onRemove}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="ml-4 flex-shrink-0 w-16 text-right">
        <p className="text-lg font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
      </div>
    </div>
  )
}
