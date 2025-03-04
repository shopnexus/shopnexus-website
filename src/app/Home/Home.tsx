import { Link } from "react-router-dom";
import Button from "../../components/ui/Button";
import FeaturedProducts from "../Product/FeaturedProducts";
import Newsletter from "../../components/Newsletter";
import SplitText from "../../blocks/TextAnimations/SplitText/SplitText";
import StarBorder from "../../blocks/Animations/StarBorder/StarBorder";
import NewProducts from "../Product/NewProducts";


const category=["Men", "Women", "Kids", "Sport"];

const handleAnimationComplete = () => {
  console.log('All letters have animated!');
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      

      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto text-center">
        <SplitText
          text="Welcome to ShopNexus!!"
          className="text-2xl font-semibold text-center sm:text-6xl"
          delay={70}
          animationFrom={{ opacity: 0, transform: 'translate3d(0,50px,0)' }}
          animationTo={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
          threshold={0.2}
          rootMargin="-50px"
          onLetterAnimationComplete={handleAnimationComplete}
        />
        <p className="mt-6 text-lg leading-8 text-gray-600">Discover the perfect pair for every occasion.</p>
        <div className="mt-10 flex items-center justify-center gap-x-6 ">
          <StarBorder
            as="button"
            className="custom-class "
            color="cyan"
            speed="5s"
          >
            <Link to="/products">Shop Now</Link>
          </StarBorder>
          <Button variant="outline">
            <Link to="/about">
              Learn more <span aria-hidden="true">→</span>
            </Link>
          </Button>
        </div>
      </section>

      {/* Featured Products */}
      <FeaturedProducts />

      {/* New Products */}
      <NewProducts />

      {/* Categories */}
      <section className="w-full max-w-7xl mx-auto mt-24">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-6">Shop by Category</h2>
        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {category.map((category) => (
            <Link key={category} to={`/category/${category.toLowerCase()}`} className="group">
              <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-w-7 xl:aspect-h-8">
                <img
                  src={`/placeholder.jpeg?height=300&width=300&text=${category}`}
                  alt={`Shop ${category} Shoes`}
                  width={300}
                  height={300}
                  className="h-full w-full object-cover object-center group-hover:opacity-75"
                />
              </div>
              <h3 className="mt-4 text-sm text-gray-700">{category}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <Newsletter />

      
    </div>
  );
}
