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
import { FeatureCategory } from "../../components/FeatureCategory";
import { motion, AnimatePresence } from "framer-motion";

const handleAnimationComplete = () => {
  console.log("All letters have animated!");
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  },
};

export default function Home() {
  const fileRef = useRef<HTMLInputElement>(null);
  const featuredProductsRef = useRef<HTMLDivElement>(null);

  const { mutateAsync } = useMutation(upload);
  const uploadFile = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
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
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex min-h-screen flex-col items-center justify-between bg-gradient-to-b from-white via-gray-50 to-gray-100"
    >
      {/* Hero Section */}
      <motion.section
        variants={itemVariants}
        className="w-full max-w-7xl mx-auto text-center mt-12 px-4"
      >
        <motion.div
          variants={itemVariants}
          className="relative"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="absolute -top-12 -left-12 w-24 h-24 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full blur-2xl opacity-20"
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.7, type: "spring" }}
            className="absolute -bottom-12 -right-12 w-24 h-24 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur-2xl opacity-20"
          />

<div className="text-2xl font-semibold text-center sm:text-6xl bg-clip-text text-black ">
  <SplitText
    text="Welcome to Shopnexus!!"
    className=""
    delay={70}
    animationFrom={{ opacity: 0, transform: "translate3d(0,50px,0)" }}
    animationTo={{ opacity: 1, transform: "translate3d(0,0,0)" }}
    threshold={0.2}
    rootMargin="-50px"
    onLetterAnimationComplete={handleAnimationComplete}
  />
</div>


          <motion.img
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            src="/favicon.png"
            alt="logo"
            className="w-16 h-24 mx-auto mt-6"
          />

          <motion.p
            variants={itemVariants}
            className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto"
          >
            Discover the perfect pair for every occasion. From casual comfort to elegant style,
            find your perfect match in our curated collection.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-10 flex items-center justify-center gap-x-6"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <StarBorder
                as="button"
                color="cyan"
                speed="5s"
                onClick={scrollToFeaturedProducts}
              >
                Shop Now
              </StarBorder>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button variant="outline">
                <Link to="/about" className="flex items-center gap-2">
                  Learn more
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Featured Products */}
        <motion.div
          ref={featuredProductsRef}
          variants={itemVariants}
          className="mt-24"
        >
          <FeaturedProducts />
        </motion.div>

        {/* Feature Category Section */}
        <motion.section
          variants={itemVariants}
          className="w-full max-w-7xl mx-auto mt-24 bg-gradient-to-br from-gray-50 to-white rounded-3xl shadow-xl p-8"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <FeatureCategory />
          </motion.div>
        </motion.section>

        {/* New Products */}
        <motion.div
          variants={itemVariants}
          className="mt-24"
        >
          <NewProducts />
        </motion.div>
      </motion.section>

      {/* Newsletter Section */}
      <motion.div
        variants={itemVariants}
        className="w-full mt-24 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
      >
        <div className="max-w-7xl mx-auto px-4 py-16">
          <Newsletter />
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div
        variants={itemVariants}
        className="w-full mt-24"
      >
        <InforFooter />
      </motion.div>
    </motion.div>
  );
}
