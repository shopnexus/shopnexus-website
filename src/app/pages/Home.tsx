import { Link } from "react-router-dom";
import Button from "../../components/ui/Button";
import FeaturedProducts from "../Products/FeaturedProducts";
import Newsletter from "../../components/Newsletter";
import SplitText from "../../blocks/TextAnimations/SplitText/SplitText";
import StarBorder from "../../blocks/Animations/StarBorder/StarBorder";
import NewProducts from "../Products/NewProducts";
import InforFooter from "../../components/InfoFooter";
import { useMutation, useQuery } from "@connectrpc/connect-query";
import { listBrands, listTags, upload } from "shopnexus-protobuf-gen-ts";
import { useRef } from "react";
import CategoryLayout from "../../components/CategoryLayout";

const handleAnimationComplete = () => {
  console.log("All letters have animated!");
};

export default function Home() {
  const fileRef = useRef<HTMLInputElement>(null);
  const featuredProductsRef = useRef<HTMLDivElement>(null);

  const { mutateAsync } = useMutation(upload);
  const uploadFile = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // debugger
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    await mutateAsync({
      name: file.name,
      content: new Uint8Array(await file.arrayBuffer()),
    });
  };

  const { data: listTag } = useQuery(listTags, {
    pagination: {
      limit: 10,
      page: 1,
    },
  });

  const scrollToFeaturedProducts = () => {
    const element = featuredProductsRef.current;
	if (element) {
		const offsetTop = element.getBoundingClientRect().top + window.pageYOffset;
		const distance = offsetTop - 200; 

		window.scrollTo({
		top: distance,
		behavior: "smooth",
		});
	}
  };

	return (
		<div className="flex min-h-screen flex-col items-center justify-between bg-white">
			{/* <input ref={fileRef} type="file" placeholder="FILE TEST" />
			<button onClick={(e) => uploadFile(e)}>TEST</button> */}

			{/* Hero Section */}
			<section className="w-full max-w-7xl mx-auto text-center mt-12">
				<SplitText
					text="Welcome to ShopNexus!!"
					className="text-2xl font-semibold text-center sm:text-6xl"
					delay={70}
					animationFrom={{ opacity: 0, transform: "translate3d(0,50px,0)" }}
					animationTo={{ opacity: 1, transform: "translate3d(0,0,0)" }}
					threshold={0.2}
					rootMargin="-50px"
					onLetterAnimationComplete={handleAnimationComplete}
				/>
				<p className="mt-6 text-lg leading-8 text-gray-600">
					Discover the perfect pair for every occasion.
				</p>
				<div className="mt-10 flex items-center justify-center gap-x-6 ">
					<StarBorder
						as="button"
						color="cyan"
						speed="5s"
						onClick={scrollToFeaturedProducts}
					>
						Shop Now
					</StarBorder>
					<Button variant="outline">
						<Link to="/about">
							Learn more <span aria-hidden="true">→</span>
						</Link>
					</Button>
				</div>
			

			{/* Featured Products */}

				<div ref={featuredProductsRef}>
					<FeaturedProducts />
				</div>
			

			{/* New Products */}
			
				<NewProducts />
			
			
		
			</section>


			{/* Newsletter */}
			<Newsletter />


    </div>
  );
}
