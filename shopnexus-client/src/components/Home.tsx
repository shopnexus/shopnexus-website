


import Button from "./ui/Button"
import FeaturedProducts from "../components/FeaturedProducts"
import Newsletter from "../components/Newsletter"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">Step into Style</h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">Discover the perfect pair for every occasion.</p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button >
            <a href="/products">Shop Now</a>
          </Button>
          <Button variant="outline" >
            <a href="/about">
              Learn more <span aria-hidden="true">→</span>
            </a>
          </Button>
        </div>
      </section>

      {/* Featured Products */}
      <FeaturedProducts />

      {/* Categories */}
      <section className="w-full max-w-7xl mx-auto mt-24">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-6">Shop by Category</h2>
        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {["Men", "Women", "Kids", "Sport"].map((category) => (
            <a key={category} href={`/category/${category.toLowerCase()}`} className="group">
              <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-w-7 xl:aspect-h-8">
                <img
                  src={`/placeholder.svg?height=300&width=300&text=${category}`}
                  alt={category}
                  width={300}
                  height={300}
                  className="h-full w-full object-cover object-center group-hover:opacity-75"
                />
              </div>
              <h3 className="mt-4 text-sm text-gray-700">{category}</h3>
            </a>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <Newsletter />
    </main>
  )
}

