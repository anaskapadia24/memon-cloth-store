import { useEffect, useState } from "react";
import { api, SIZES, type ProductColor, type SizeStock } from "../lib/api.ts";
import { toast } from "../lib/toast.ts";
import { NumberInput } from "./NumberInput.tsx";

type Preview = { src: string; file?: File };

export function ColorVariantForm({
  productId,
  index,
  initial,
  basePrice,
  onSaved,
  onCancel,
}: {
  productId: string;
  index: number | null;
  initial: ProductColor | null;
  basePrice: number;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState(0);
  const [sizes, setSizes] = useState<SizeStock[]>(
    SIZES.map((s) => ({ size: s, stock: 0 })),
  );
  const [images, setImages] = useState<Preview[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(initial?.name || "");
    setPrice(initial?.price ? String(initial.price) : "");
    setStock(initial?.stock || 0);
    setSizes(
      SIZES.map((s) => ({
        size: s,
        stock: initial?.sizes?.find((x) => x.size === s)?.stock || 0,
      })),
    );
    setImages((initial?.images || []).map((src) => ({ src })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  function addFiles(files: File[]) {
    const room = 10 - images.length;
    const next = files
      .filter((f) => f.type.startsWith("image/") && f.size <= 5 * 1024 * 1024)
      .slice(0, room);
    if (!next.length) return;
    setImages((cur) => [
      ...cur,
      ...next.map((file) => ({ src: URL.createObjectURL(file), file })),
    ]);
  }

  async function save() {
    if (!name.trim()) {
      toast("Color name is required", "error");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("price", String(Number(price) || 0));
      fd.append("stock", String(stock));
      fd.append("sizes", JSON.stringify(sizes));
      images.forEach((img, i) => {
        if (img.file)
          fd.append("images", img.file, img.file.name || `color-${i}.jpg`);
      });
      const path =
        index === null
          ? `/products/${productId}/colors`
          : `/products/${productId}/colors/${index}`;
      await api(path, { method: index === null ? "POST" : "PUT", body: fd });
      toast("Color variant saved");
      onSaved();
    } catch {
      toast("Failed to save color variant", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="color-variant-form">
      <div className="form-group">
        <label>Color Name *</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. White & Green"
        />
      </div>
      <div className="form-group">
        <label>Price for this color (₹), optional</label>
        <input
          type="number"
          min={0}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder={`Leave blank to use base price ₹${basePrice || 0}`}
        />
      </div>
      <div className="form-group">
        <label>Photos for this Color</label>
        <div
          className="image-upload-area"
          onClick={() =>
            document.getElementById(`colorImageFile-${index}`)?.click()
          }
        >
          <i className="fas fa-cloud-upload-alt" />
          <p>Click to browse photos for this color</p>
          <small>
            Supports: JPG, PNG, WebP (Max 5MB each, up to 10 images)
          </small>
          <input
            id={`colorImageFile-${index}`}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => addFiles(Array.from(e.target.files || []))}
          />
        </div>
        <div className="multi-image-preview">
          {images.map((img, i) => (
            <div className="multi-image-thumb" key={img.src}>
              <img src={img.src} alt="" />
              <button
                type="button"
                className="remove-image"
                onClick={() =>
                  setImages((cur) => cur.filter((_, j) => j !== i))
                }
              >
                <i className="fas fa-times" />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="form-group">
        <label>
          Total Stock Quantity (used only if you leave Size-wise Stock all at 0)
        </label>
        <NumberInput min={0} value={stock} onChange={setStock} />
      </div>
      <div className="form-group">
        <label>Size-wise Stock for this Color</label>
        <div className="size-grid">
          {sizes.map((s, i) => (
            <div className="size-item" key={s.size}>
              <label>{s.size}</label>
              <NumberInput
                min={0}
                value={s.stock}
                onChange={(stockVal) =>
                  setSizes((cur) =>
                    cur.map((x, j) =>
                      j === i ? { ...x, stock: stockVal } : x,
                    ),
                  )
                }
              />
            </div>
          ))}
        </div>
      </div>
      <div className="color-variant-form-actions">
        <button
          type="button"
          className="btn btn-sm btn-outline"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-sm btn-primary"
          disabled={saving}
          onClick={() => void save()}
        >
          <i className="fas fa-save" /> Save Color
        </button>
      </div>
    </div>
  );
}
