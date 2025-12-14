import { client } from "@/sanity/lib/client"
import { groq } from "next-sanity"

import { SanityProduct } from "@/config/inventory"
import { cn } from "@/lib/utils"
import { ProductFilters } from "@/components/product-filters"
import { ProductGrid } from "@/components/product-grid"
import { ProductSort } from "@/components/product-sort"
import { MarketingHero } from "@/components/marketing-hero"

interface Props {
  searchParams: {
    date?: string
    price?: string
    color?: string
    category?: string
    size?: string
    search?: string
  }
}

export default async function Page({searchParams}: Props) {
  
  const { date = "desc", price, color, category, size, search } = searchParams;
  const priceOrder = price ? `order(price ${price})` : "";
  const dateOrder = date ? `order(_createdAt ${date})` : "";
  const order = priceOrder
  ? `${priceOrder} | ${dateOrder}`
  : `${priceOrder}${dateOrder}`;

  const productFilter = `_type == "product"`
  const colorFilter = color ? `&& "${color}" in colors` : ""
  const categoryFilter = category ? `&& "${category}" in categories` : ""
  const sizeFilter = size ? `&& "${size}" in sizes` : ""
  const searchFilter = search ? `&& name match "${search}*"` : ""
  const filter = `*[${productFilter}${colorFilter}${categoryFilter}${sizeFilter}${searchFilter}]`

  const products = await client.fetch<SanityProduct[]>(
  groq`*[_type == "product"] | ${order} {
    _id,
    _createdAt,
    name,
    sku,
    images,
    currency,
    price,
    description,
    categories,
    "slug": slug.current
  }`
  );

  return (
    <div>
      {/* Marketing Hero Section */}
      <MarketingHero />

      {/* Products Section */}
      <div id="products">
        <main className="mx-auto max-w-6xl px-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4 pt-12 dark:border-gray-800">
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              {products.length} result{products.length === 1 ? "" : "s" }
            </h1>
            <ProductSort />
          </div>

          <section aria-labelledby="products-heading" className="pb-24 pt-6">
            <h2 id="products-heading" className="sr-only">
              Products
            </h2>
            <div className={cn("grid grid-cols-1 gap-x-8 gap-y-10 ", products.length > 0 ? 
            "lg:grid-cols-4" : "lg:grid-cols-[1fr_3fr]")}>
              <div className="hidden lg:block">
                <ProductFilters />
              </div>
              <ProductGrid products={products} />
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
