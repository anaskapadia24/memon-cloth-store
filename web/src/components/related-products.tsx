import { getProducts } from "@/lib/products";
import { ProductCard } from "./product-card";
import type { Product } from "@/lib/types";

export async function RelatedProducts({ product }: { product: Product }) {
  const inCategory = await getProducts({ category: product.cat }).catch(
    () => [] as Product[],
  );
  const related = inCategory.filter((p) => p._id !== product._id).slice(0, 4);

  if (!related.length) return null;

  return (
    <section className="related-products">
      <h2 className="section-title" style={{ fontSize: "1.4rem" }}>
        You May Also Like
      </h2>
      <div className="products-grid">
        {related.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </section>
  );
}
