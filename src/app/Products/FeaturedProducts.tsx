import ProductCard from "../../components/ProductCard";
import { useInfiniteQuery } from "@connectrpc/connect-query";
import { listProductModels } from "shopnexus-protobuf-gen-ts";
import React, { useEffect } from "react";
import Button from "../../components/ui/Button";

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

  // Automatically load the second page after the first page is loaded
  useEffect(() => {
    if (productModels?.pages.length === 1 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [productModels?.pages.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

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
          .map((productModel) => (
            <div key={productModel.id}>
              <ProductCard id={productModel.id} />
            </div>
          ))}
      </div>
      {hasNextPage && (productModels?.pages?.length ?? 0) >= 2 && (
        <div className="flex justify-center mt-8">
          <Button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="px-6 py-3"
          >
            {isFetchingNextPage ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </section>
  );
}
