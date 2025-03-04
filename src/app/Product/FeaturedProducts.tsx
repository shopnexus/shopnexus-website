import ProductCard from "../../components/ProductCard"

const featuredProducts = [
  { id: 1, name: "Classic Sneakers", price: 89.99, image: "/placeholder.jpeg?height=300&width=300&text=Sneakers" },
  { id: 2, name: "Running Shoes", price: 129.99, image: "/placeholder.jpeg?height=300&width=300&text=Running" },
  { id: 3, name: "Casual Loafers", price: 79.99, image: "/placeholder.jpeg?height=300&width=300&text=Loafers" },
  { id: 4, name: "Classic Sneakers", price: 89.99, image: "/placeholder.jpeg?height=300&width=300&text=Sneakers" },

]

export default function FeaturedProducts() {
  return (
    <section className="w-full max-w-7xl mx-auto mt-24">
      <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-6">Feature Products</h2>
      <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
        {featuredProducts.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </section>
  )
}

