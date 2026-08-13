import { useState } from "react";
import { CategoryModal } from "../components/CategoryModal.tsx";
import { api, useAsync, type Category, type Product } from "../lib/api.ts";
import { toast } from "../lib/toast.ts";

export function Categories() {
  const { data, error, loading, reload } = useAsync(async () => {
    const [categories, products] = await Promise.all([
      api<Category[]>("/categories"),
      api<Product[]>("/products"),
    ]);
    return { categories, products };
  }, []);
  const [editing, setEditing] = useState<Category | null | undefined>(
    undefined,
  );

  async function remove(id: string) {
    const count = (data?.products || []).filter((p) => p.cat === id).length;
    if (count > 0) {
      alert(
        `Cannot delete: ${count} products are using this category. Reassign them first.`,
      );
      return;
    }
    if (!confirm("Delete this category?")) return;
    try {
      await api(`/categories/${id}`, { method: "DELETE" });
      toast("Category deleted");
      await reload();
    } catch (e) {
      toast((e as Error).message || "Failed to delete category", "error");
    }
  }

  return (
    <div className="tab-content">
      <div className="admin-header">
        <div>
          <h2>Categories</h2>
          <p>Manage product categories</p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing(null)}>
          <i className="fas fa-plus" /> Add Category
        </button>
      </div>
      <div className="admin-section">
        {loading ? (
          <p>Loading…</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <div className="data-list">
            {(data?.categories || []).map((c) => {
              const count = (data?.products || []).filter(
                (p) => p.cat === c.id,
              ).length;
              return (
                <div className="data-item" key={c.id}>
                  <div className="info">
                    <h4>{c.name}</h4>
                    <p>
                      {count} products • Slug: {c.id}
                    </p>
                  </div>
                  <div className="actions">
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => setEditing(c)}
                    >
                      <i className="fas fa-edit" />
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => void remove(c.id)}
                    >
                      <i className="fas fa-trash" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <CategoryModal
        open={editing !== undefined}
        initial={editing || null}
        onClose={() => setEditing(undefined)}
        onSaved={() => void reload()}
      />
    </div>
  );
}
