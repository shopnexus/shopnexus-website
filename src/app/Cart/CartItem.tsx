"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Minus, Plus, Trash2 } from "lucide-react"
import Button from "../../components/ui/Button"
import Checkbox from "../../components/ui/Checkbox"

interface CartItemProps {
  item: {
    itemId: bigint
    quantity: bigint
    metadata: {
      color: string
      size: string
    }
  }
  product: {
    id: bigint
    name: string
    listPrice: number
    resources: string[]
  }
  selected: boolean
  onSelect: () => void
  onRemove: () => void
  onUpdateQuantity: (newQuantity: number) => void
  onPriceUpdate?: (price: number) => void
}

export default function CartItem({
  item,
  product,
  selected = false,
  onSelect = () => {},
  onRemove,
  onUpdateQuantity,
  onPriceUpdate,
}: CartItemProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleIncrement = () => {
    onUpdateQuantity(Number(item.quantity) + 1)
  }

  const handleDecrement = () => {
    if (Number(item.quantity) > 1) {
      onUpdateQuantity(Number(item.quantity) - 1)
    }
  }

  useEffect(() => {
    if (product?.listPrice) {
      onPriceUpdate?.(product.listPrice)
    }
  }, [product?.listPrice, onPriceUpdate])

  if (!product) {
    return <div className="py-6 px-4 bg-red-50 text-red-500 rounded-md">Product not found</div>
  }

  return (
    <div
      className="flex items-center py-6"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Checkbox checked={selected} onCheckedChange={onSelect} className="mr-4" id={`item-${String(item.itemId)}`} />

      <Link to={`/product/${item.itemId}`} className="relative group">
        <div className="h-24 w-24 rounded-md overflow-hidden bg-gray-100">
          <img
            src={product.resources[0] || "/placeholder.svg"}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>
      </Link>

      <div className="ml-4 flex-grow">
        <Link to={`/product/${item.itemId}`}>
          <h3 className="text-lg font-medium hover:text-primary transition-colors">{product.name}</h3>
        </Link>
        <p className="text-gray-500 text-sm mt-1">
          {item.metadata.color} | Size: {item.metadata.size}
        </p>
        <p className="text-gray-600 mt-1">{product.listPrice.toLocaleString()} ₫</p>

        <div className="mt-3 flex items-center">
          <div className="flex items-center space-x-2">
            <div className="flex items-center border rounded-lg overflow-hidden bg-gray-50">
              <button
                onClick={() => handleDecrement()}
                disabled={Number(item.quantity) <= 1}
                className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              
              <span className="w-12 text-center py-1.5 font-medium">
                {Number(item.quantity)}
              </span>
              
              <button
                onClick={() => handleIncrement()}
                className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <Button
              size="md"
              onClick={onRemove}
              className={`text-gray-400 hover:text-red-500 transition-opacity ${
                isHovered ? "opacity-100" : "opacity-0 md:opacity-100"
              }`}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Remove item</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="ml-4 flex-shrink-0 text-right">
        <p className="text-lg font-semibold">
          {(product.listPrice * Number(item.quantity)).toLocaleString()} ₫
        </p>
      </div>
    </div>
  )
}
