import ProductCard from "../../components/ProductCard";
import { useInfiniteQuery } from "@connectrpc/connect-query";
import { listProductModels } from "shopnexus-protobuf-gen-ts";
import React from "react";

interface FeaturedProductsProps {
  title?: string;
  limit?: number;
  className?: string;
}

export default function FeaturedProducts({
  title = "Best seller",
  limit = 4,
  className = "",
}: FeaturedProductsProps) {
  const {
    data: productModels,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    listProductModels,
    {
      pagination: {
        limit: 5,
        page: 1,
      },
    },
    {
      pageParamKey: "pagination",
      getNextPageParam: (lastPage) => {
        if (lastPage.pagination?.nextPage) {
          return {
            limit: 10,
            page: lastPage.pagination.nextPage,
          };
        }
      },
    }
  );

  // Create a ref for the last product element
  const lastProductRef = React.useRef<HTMLDivElement>(null);

  // Set up an intersection observer to detect when the last element is visible
  React.useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 } // Trigger when at least 10% of the element is visible
    );

    if (lastProductRef.current) {
      observer.observe(lastProductRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, productModels]);

  if (isLoading) {
    return (
      <section className={`w-full max-w-7xl mx-auto mt-24 ${className}`}>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-6">
          {title}
        </h2>
        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-4 ">
          {Array(limit)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="animate-pulse  h-64 rounded"></div>
            ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={`w-full max-w-7xl mx-auto mt-24 ${className}`}>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-6">
          {title}
        </h2>
        <p className="text-red-500">Failed to load products</p>
      </section>
    );
  }

  return (
    <section className={`w-full max-w-7xl mx-auto mt-24 ${className}`}>
      <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-6">
        {title}
      </h2>
      <div className="grid grid-cols-2 gap-y-10 gap-x-6 md:grid-cols-2 lg:grid-cols-3  xl:grid-cols-4 xl:gap-x-8">
        {productModels?.pages
          .flatMap((page) => page.data)
          .map((productModel, index, array) => (
            <div
              key={productModel.id}
              ref={index === array.length - 1 ? lastProductRef : undefined}
            >
              <ProductCard id={productModel.id} />
            </div>
          ))}
      </div>
      {isFetchingNextPage && (
        <div className="flex justify-center mt-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}
      {/* {!hasNextPage &&
        productModels?.pages.length &&
        productModels?.pages.length > 0 && (
          <p className="text-center text-gray-500 mt-8">
            No more products to load
          </p>
        )} */}
    </section>
  );
}
