import ProductCard from "../../components/ProductCard";
import { useInfiniteQuery } from "@connectrpc/connect-query";
import { listProductModels } from "shopnexus-protobuf-gen-ts";
import React from "react";

export default function NewProducts() {
  const {
    data: products,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    listProductModels,
    {
      pagination: {
        limit: 8,
        page: 1,
      },
    },
    {
      pageParamKey: "pagination",
      getNextPageParam: (lastPage) => {
        if (lastPage.pagination?.nextPage) {
          return {
            limit: 8,
            page: lastPage.pagination.nextPage,
          };
        }
      },
    }
  );

  const lastProductRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (lastProductRef.current) {
      observer.observe(lastProductRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, products]);

  return (
    <section className="w-full max-w-7xl mx-auto mt-24">
      <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-6">
        New Products
      </h2>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-y-10 gap-x-6 md:grid-cols-2 lg:grid-cols-3  xl:grid-cols-4 xl:gap-x-8">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="animate-pulse h-64 rounded"></div>
            ))}
        </div>
      ) : error ? (
        <p className="text-red-500">Failed to load new products.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-y-10 gap-x-6 md:grid-cols-2 lg:grid-cols-3  xl:grid-cols-4 xl:gap-x-8">
            {products?.pages
              .flatMap((page) => page.data)
              .map((product, index, array) => (
                <div
                  key={product.id}
                  ref={index === array.length - 1 ? lastProductRef : undefined}
                >
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    price={Number(product.listPrice)}
                    image={
                      product.resources?.[0] ||
                      "/placeholder.jpeg?height=300&width=300&text=Product"
                    }
                  />
                </div>
              ))}
          </div>
          {isFetchingNextPage && (
            <div className="flex justify-center mt-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          )}
          {!hasNextPage &&
            products?.pages?.length &&
            products.pages.length > 0 && (
              <p className="text-center text-gray-500 mt-8">
                No more products to load
              </p>
            )}
        </>
      )}
    </section>
  );
}
