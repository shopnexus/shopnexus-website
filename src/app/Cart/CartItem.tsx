"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useQuery } from "@connectrpc/connect-query"
import { getProductModel } from "shopnexus-protobuf-gen-ts"
import { Minus, Plus, Trash2 } from "lucide-react"

import Button from "../../components/ui/Button"
import Checkbox from "../../components/ui/Checkbox"
import { Skeleton } from "@mui/material"

const useProductModel = (itemId: bigint) => {
  const { data, isLoading, error } = useQuery(getProductModel, {
    id: itemId,
  })

  return { data, isLoading, error }
}

interface CartItemProps {
  item: {
    itemId: bigint
    quantity: bigint
  }
  selected: boolean
  onSelect: () => void
  onRemove: () => void
  onUpdateQuantity: (newQuantity: number) => void
  onPriceUpdate?: (price: number) => void
}

export default function CartItem({
  item,
  selected = false,
  onSelect = () => {},
  onRemove,
  onUpdateQuantity,
  onPriceUpdate,
}: CartItemProps) {
  const { data: productModel, isLoading, error } = useProductModel(item.itemId)
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
    if (productModel?.data?.listPrice) {
      onPriceUpdate?.(Number(productModel.data.listPrice));
    }
  }, [productModel?.data?.listPrice, onPriceUpdate]);

  if (isLoading) {
    return (
      <div className="flex items-center py-6">
        <Checkbox className="mr-4" disabled />
        <Skeleton className="h-24 w-24 rounded-md" />
        <div className="ml-4 flex-grow">
          <Skeleton className="h-5 w-40 mb-2" />
          <Skeleton className="h-4 w-20 mb-4" />
          <Skeleton className="h-8 w-28" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
    )
  }

  if (error || !productModel?.data) {
    return <div className="py-6 px-4 bg-red-50 text-red-500 rounded-md">Error loading product information</div>
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
            src={productModel.data.resources?.[0] || "/placeholder.svg"}
            alt={productModel.data.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>
      </Link>

      <div className="ml-4 flex-grow">
        <Link to={`/product/${item.itemId}`}>
          <h3 className="text-lg font-medium hover:text-primary transition-colors">{productModel.data.name}</h3>
        </Link>

        <p className="text-gray-600 mt-1">${Number(productModel.data.listPrice).toFixed(2)}</p>

        <div className="mt-3 flex items-center">
          <div className="flex items-center border rounded-md">
            <Button
              size="sm"
              className="h-8 w-8 rounded-none"
              onClick={handleDecrement}
              disabled={Number(item.quantity) <= 1}
            >
              <Minus className="h-3 w-3" />
              <span className="sr-only">Decrease quantity</span>
            </Button>

            <div className="w-10 text-center">{Number(item.quantity)}</div>

            <Button size="sm" className="h-8 w-8 rounded-none" onClick={handleIncrement}>
              <Plus className="h-3 w-3" />
              <span className="sr-only">Increase quantity</span>
            </Button>
          </div>

          <Button

            size="md"
            onClick={onRemove}
            className={`ml-4 text-gray-400 hover:text-red-500 transition-opacity ${isHovered ? "opacity-100" : "opacity-0 md:opacity-100"}`}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Remove item</span>
          </Button>
        </div>
      </div>

      <div className="ml-4 flex-shrink-0 text-right">
        <p className="text-lg font-semibold">
          ${(Number(productModel.data.listPrice) * Number(item.quantity)).toFixed(2)}
        </p>
      </div>
    </div>
  )
}
