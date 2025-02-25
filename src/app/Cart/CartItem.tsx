import { Trash2 } from "lucide-react"
import Button from "../../components/ui/Button"
import Input from "../../components/ui/Input"

interface CartItemProps {
  item: {
    id: number
    name: string
    price: number
    quantity: number
    image: string
  }
  onRemove: () => void
  onUpdateQuantity: (newQuantity: number) => void
}

export default function CartItem({ item, onRemove, onUpdateQuantity }: CartItemProps) {
  return (
    <div className="flex items-center py-6 border-b">
      <img src={item.image || "/placeholder.svg"} alt={item.name} width={100} height={100} className="rounded-md" />
      <div className="ml-4 flex-grow">
        <h3 className="text-lg font-medium">{item.name}</h3>
        <p className="text-gray-600">${item.price.toFixed(2)}</p>
        <div className="mt-2 flex items-center">
          <Input
            type="number"
            min="1"
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
