import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductFormModal } from "../components/ProductFormModal.tsx";
import {
  api,
  catName,
  useAsync,
  type Category,
  type Product,
} from "../lib/api.ts";
import { toast } from "../lib/toast.ts";

const PLACEHOLDER = "images.unsplash.com";

export function Products() {
  const { data, error, loading, reload } = useAsync(async () => {
    const [products, categories] = await Promise.all([
      api<Product[]>("/products"),
      api<Category[]>("/categories"),
    ]);
    return { products, categories };
  }, []);
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const stock = params.get("stock") || "all";
  const cat = params.get("cat") || "all";
  const flag = params.get("flag") || "";
  const [editing, setEditing] = useState<Product | null | undefined>(undefined);

  function set(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (!value || value === "all") next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  }

  const products = data?.products || [];
  const categories = data?.categories || [];
  const counts = {
    all: products.length,
    in: products.filter((p) => p.stock > 5).length,
    low: products.filter((p) => p.stock > 0 && p.stock <= 5).length,
    out: products.filter((p) => p.stock === 0).length,
  };

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return products.filter((p) => {
      if (
        query &&
        !(p.sku || "").toLowerCase().includes(query) &&
        !p.name.toLowerCase().includes(query)
      )
        return false;
      if (cat !== "all" && p.cat !== cat) return false;
      if (stock === "in" && p.stock <= 5) return false;
      if (stock === "low" && !(p.stock > 0 && p.stock <= 5)) return false;
      if (stock === "out" && p.stock !== 0) return false;
      if (flag === "nosku" && p.sku) return false;
      if (flag === "photo" && p.img && !p.img.includes(PLACEHOLDER))
        return false;
      return true;
    });
  }, [products, q, stock, cat, flag]);

  async function markSoldOut(id: string) {
    if (
      !confirm(
        "Mark this product as Sold Out? This will set all stock (including any color variants) to 0.",
      )
    )
      return;
    try {
      await api(`/products/${id}/sold-out`, { method: "PUT" });
      toast("Product marked as Sold Out");
      await reload();
    } catch {
      toast("Failed to mark as sold out", "error");
    }
  }

  async function remove(id: string) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await api(`/products/${id}`, { method: "DELETE" });
      toast("Product deleted");
      await reload();
    } catch (e) {
      toast((e as Error).message, "error");
    }
  }

  return (
    <div className="tab-content">
      <div className="admin-header">
        <div>
          <h2>Products</h2>
          <p>
            {counts.all} in catalog · {counts.out} sold out · {counts.low}{" "}
            running low
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing(null)}>
          <i className="fas fa-plus" /> Add Product
        </button>
      </div>

      <div className="toolbar">
        <input
          className="toolbar-search"
          value={q}
          onChange={(e) => set("q", e.target.value)}
          placeholder="Search name or SKU…"
        />
        <select value={cat} onChange={(e) => set("cat", e.target.value)}>
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <div className="chip-row">
          {(["all", "in", "low", "out"] as const).map((k) => (
            <button
              key={k}
              type="button"
              className={`chip${stock === k ? " on" : ""}`}
              onClick={() => set("stock", k)}
            >
              {k === "all"
                ? `All ${counts.all}`
                : k === "in"
                  ? `In stock ${counts.in}`
                  : k === "low"
                    ? `Low ${counts.low}`
                    : `Sold out ${counts.out}`}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-section table-wrap">
        {loading ? (
          <p>Loading…</p>
        ) : error ? (
          <p>{error}</p>
        ) : !products.length ? (
          <div className="empty-state">
            <i className="fas fa-box-open" />
            <h4>No products yet</h4>
            <p>Add your first product to get started</p>
          </div>
        ) : !filtered.length ? (
          <div className="empty-state">
            <i className="fas fa-search" />
            <h4>No matching products</h4>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Colors</th>
                <th className="actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p._id}>
                  <td>
                    <button
                      type="button"
                      className="prod-cell"
                      onClick={() => setEditing(p)}
                    >
                      <img
                        src={p.img}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=100&q=80";
                        }}
                      />
                      <span>
                        <strong>{p.name}</strong>
                        <small>{p.sku || "No SKU"}</small>
                      </span>
                    </button>
                  </td>
                  <td>{catName(categories, p.cat)}</td>
                  <td className="num">₹{p.price}</td>
                  <td>
                    <span
                      className={`pill ${p.comingSoon ? "soon" : p.stock === 0 ? "bad" : p.stock <= 5 ? "warn" : "ok"}`}
                    >
                      {p.comingSoon
                        ? "Coming soon"
                        : p.stock === 0
                          ? "Sold out"
                          : p.stock <= 5
                            ? `${p.stock} left`
                            : p.stock}
                    </span>
                  </td>
                  <td>{p.colors?.length || 0}</td>
                  <td className="actions">
                    {p.stock > 0 && !p.comingSoon ? (
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => void markSoldOut(p._id)}
                        title="Mark sold out"
                      >
                        <i className="fas fa-ban" />
                      </button>
                    ) : (
                      <span className="btn-slot" />
                    )}
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => setEditing(p)}
                      title="Edit"
                    >
                      <i className="fas fa-edit" />
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => void remove(p._id)}
                      title="Delete"
                    >
                      <i className="fas fa-trash" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <ProductFormModal
        open={editing !== undefined}
        product={editing || null}
        categories={categories}
        onClose={() => setEditing(undefined)}
        onSaved={() => void reload()}
      />
    </div>
  );
}
