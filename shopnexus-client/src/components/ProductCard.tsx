
import  Button  from "./ui/Button"

interface ProductCardProps {
  id: number
  name: string
  price: number
  image: string
}

export default function ProductCard({ id, name, price, image }: ProductCardProps) {
  return (
    <div className="group relative">
      <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-80">
        <img
          src={image || "/placeholder.svg"}
          alt={name}
          width={300}
          height={300}
          className="h-full w-full object-cover object-center lg:h-full lg:w-full"
        />
      </div>
      <div className="mt-4 flex justify-between">
        <div>
          <h3 className="text-sm text-gray-700">
            <a href={`/product/${id}`}>
              <span aria-hidden="true" className="absolute inset-0" />
              {name}
            </a>
          </h3>
        </div>
        <p className="text-sm font-medium text-gray-900">${price.toFixed(2)}</p>
      </div>
      <Button className="mt-2 w-full">Add to Cart</Button>
    </div>
  )
}

