import { useEffect, useState } from "react";
import { api, type Category } from "../lib/api.ts";
import { toast } from "../lib/toast.ts";
import { Modal } from "./Modal.tsx";

export function CategoryModal({
  open,
  initial,
  onClose,
  onSaved,
}: {
  open: boolean;
  initial: Category | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(initial?.name || "");
    setSlug(initial?.id || "");
  }, [open, initial]);

  async function save() {
    if (!name.trim() || !slug.trim()) {
      toast("Name and slug are required", "error");
      return;
    }
    setSaving(true);
    try {
      const body = JSON.stringify({ id: slug.trim(), name: name.trim() });
      if (initial)
        await api(`/categories/${initial.id}`, { method: "PUT", body });
      else await api("/categories", { method: "POST", body });
      toast(initial ? "Category updated" : "Category added");
      onSaved();
      onClose();
    } catch {
      toast("Failed to save category", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      title={initial ? "Edit Category" : "Add Category"}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={saving}
            onClick={() => void save()}
          >
            <i className="fas fa-save" /> Save Category
          </button>
        </>
      }
    >
      <div className="form-group">
        <label>Category Name *</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Slug (URL-friendly) *</label>
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="e.g. dress-material"
        />
      </div>
    </Modal>
  );
}
