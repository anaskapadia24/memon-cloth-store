import { useEffect, useState } from "react";
import {
  api,
  SIZES,
  type Category,
  type Product,
  type ProductColor,
  type SizeStock,
} from "../lib/api.ts";
import { toast } from "../lib/toast.ts";
import { ColorVariantForm } from "./ColorVariantForm.tsx";
import { Modal } from "./Modal.tsx";
import { NumberInput } from "./NumberInput.tsx";

type Preview = { src: string; file?: File };

const emptySizes = (): SizeStock[] => SIZES.map((s) => ({ size: s, stock: 0 }));

export function ProductFormModal({
  open,
  product,
  categories,
  onClose,
  onSaved,
}: {
  open: boolean;
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [cat, setCat] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [stock, setStock] = useState("0");
  const [desc, setDesc] = useState("");
  const [badge, setBadge] = useState("");
  const [featured, setFeatured] = useState(false);
  const [comingSoon, setComingSoon] = useState(false);
  const [comingSoonKind, setComingSoonKind] = useState<
    "" | "launch" | "restock"
  >("");
  const [comingSoonNote, setComingSoonNote] = useState("");
  const [color, setColor] = useState("");
  const [fabric, setFabric] = useState("");
  const [size, setSize] = useState("");
  const [setInclude, setSetInclude] = useState("");
  const [work, setWork] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sizes, setSizes] = useState<SizeStock[]>(emptySizes);
  const [images, setImages] = useState<Preview[]>([]);
  const [saving, setSaving] = useState(false);
  const [colors, setColors] = useState<ProductColor[]>([]);
  const [expandedColor, setExpandedColor] = useState<number | "new" | null>(
    null,
  );
  const [videos, setVideos] = useState<string[]>([]);
  const [videoInput, setVideoInput] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(product?.name || "");
    setSku(product?.sku || "");
    setCat(product?.cat || "");
    setPrice(product ? String(product.price) : "");
    setOriginalPrice(
      product?.originalPrice ? String(product.originalPrice) : "",
    );
    setStock(String(product?.stock ?? 0));
    setDesc(product?.desc || "");
    setBadge(product?.badge || "");
    setFeatured(!!product?.featured);
    setComingSoon(!!product?.comingSoon);
    setComingSoonKind(product?.comingSoonKind || "");
    setComingSoonNote(product?.comingSoonNote || "");
    setColor(product?.color || "");
    setFabric(product?.fabric || "");
    setSize(product?.size || "");
    setSetInclude(product?.setInclude || "");
    setWork(product?.work || "");
    setImageUrl(
      product &&
        !product.images?.length &&
        product.img &&
        !product.img.startsWith("data:")
        ? product.img
        : "",
    );
    setSizes(
      SIZES.map((s) => ({
        size: s,
        stock: product?.sizes?.find((x) => x.size === s)?.stock || 0,
      })),
    );
    const existing = product?.images?.length
      ? product.images
      : product?.img
        ? [product.img]
        : [];
    setImages(existing.map((src) => ({ src })));
    setColors(product?.colors || []);
    setExpandedColor(null);
    setVideos(product?.videos || []);
    setVideoInput("");
  }, [open, product]);

  function addVideo() {
    const url = videoInput.trim();
    if (!url) return;
    if (!/^https?:\/\/.+/i.test(url)) {
      toast("Enter a valid video URL", "error");
      return;
    }
    setVideos((cur) => [...cur, url]);
    setVideoInput("");
  }

  function addFiles(files: File[]) {
    const room = 10 - images.length;
    const next = files
      .filter((f) => f.type.startsWith("image/") && f.size <= 5 * 1024 * 1024)
      .slice(0, Math.max(0, room));
    if (files.length && !next.length)
      toast("Maximum 10 images, 5MB each", "error");
    if (!next.length) return;
    setImages((cur) => [
      ...cur,
      ...next.map((file) => ({ src: URL.createObjectURL(file), file })),
    ]);
  }

  async function save() {
    if (!name.trim() || !cat || !price) {
      toast("Name, category and price are required", "error");
      return;
    }
    setSaving(true);
    try {
      const sizeStock = sizes.reduce((sum, s) => sum + s.stock, 0);
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("cat", cat);
      fd.append("sku", sku.trim());
      fd.append("price", String(Number(price)));
      fd.append("originalPrice", String(Number(originalPrice) || 0));
      fd.append(
        "stock",
        String(sizeStock > 0 ? sizeStock : Number(stock) || 0),
      );
      fd.append("sizes", JSON.stringify(sizes));
      fd.append("desc", desc);
      fd.append("badge", badge);
      fd.append("featured", featured ? "true" : "false");
      fd.append("comingSoon", comingSoon ? "true" : "false");
      fd.append("comingSoonKind", comingSoon ? comingSoonKind : "");
      fd.append("comingSoonNote", comingSoon ? comingSoonNote : "");
      fd.append("color", color);
      fd.append("fabric", fabric);
      fd.append("size", size);
      fd.append("setInclude", setInclude);
      fd.append("work", work);
      fd.append("videos", JSON.stringify(videos));
      if (imageUrl) fd.append("imageUrl", imageUrl);
      images.forEach((img, i) => {
        if (img.file)
          fd.append("images", img.file, img.file.name || `image-${i}.jpg`);
      });
      if (product)
        await api(`/products/${product._id}`, { method: "PUT", body: fd });
      else await api("/products", { method: "POST", body: fd });
      toast(product ? "Product updated" : "Product added");
      onSaved();
      onClose();
    } catch (e) {
      toast((e as Error).message || "Failed to save product", "error");
    } finally {
      setSaving(false);
    }
  }

  async function refreshColors() {
    if (!product) return;
    const fresh = await api<Product>(`/products/${product._id}`);
    setColors(fresh.colors || []);
    onSaved();
  }

  async function deleteColor(i: number) {
    if (!product || !confirm("Delete this color variant?")) return;
    try {
      await api(`/products/${product._id}/colors/${i}`, { method: "DELETE" });
      toast("Color variant deleted");
      await refreshColors();
    } catch {
      toast("Failed to delete color variant", "error");
    }
  }

  return (
    <>
      <Modal
        open={open}
        title={product ? "Edit Product" : "Add Product"}
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
              <i className="fas fa-save" /> Save Product
            </button>
          </>
        }
      >
        <div className="form-group">
          <label>Product Name *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Product Code / Barcode No.</label>
          <input
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="e.g. your barcode number"
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Category *</label>
            <select value={cat} onChange={(e) => setCat(e.target.value)}>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Price (₹) *</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
        </div>
        <div className="form-group">
          <label>
            Original Price (₹), optional, leave blank if not on sale
          </label>
          <input
            type="number"
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
            placeholder="e.g. 2250"
          />
        </div>
        <div className="form-group">
          <label>Stock Quantity *</label>
          <input
            type="number"
            min={0}
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Product Images (up to 10)</label>
          <div
            className="image-upload-area"
            onClick={() => document.getElementById("pImageFile")?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              addFiles(
                Array.from(e.dataTransfer.files).filter((f) =>
                  f.type.startsWith("image/"),
                ),
              );
            }}
          >
            <i className="fas fa-cloud-upload-alt" />
            <p>Drag & drop images here or click to browse</p>
            <small>
              Supports: JPG, PNG, WebP (Max 10MB each, up to 10 images)
            </small>
            <input
              id="pImageFile"
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
                {i === 0 ? (
                  <span className="primary-badge">Primary</span>
                ) : null}
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
          <div className="image-or">OR</div>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Or paste image URL here"
          />
        </div>
        <div className="form-group">
          <label>
            Size-wise Stock (used only if this product has no color variants)
          </label>
          <div className="size-grid">
            {sizes.map((s, i) => (
              <div className="size-item" key={s.size}>
                <label>{s.size}</label>
                <NumberInput
                  min={0}
                  value={s.stock}
                  onChange={(v) =>
                    setSizes((cur) =>
                      cur.map((x, j) => (j === i ? { ...x, stock: v } : x)),
                    )
                  }
                />
              </div>
            ))}
          </div>
        </div>
        {product ? (
          <div className="form-group">
            <label>Color Variants</label>
            <div style={{ display: "grid", gap: 10, marginBottom: 12 }}>
              {colors.length === 0 && expandedColor !== "new" ? (
                <p style={{ fontSize: ".85rem", color: "var(--gray-500)" }}>
                  No colors added yet.
                </p>
              ) : (
                colors.map((c, i) => {
                  if (expandedColor === i) {
                    return (
                      <ColorVariantForm
                        key={`${c.name}-${i}`}
                        productId={product._id}
                        index={i}
                        initial={c}
                        basePrice={Number(price) || 0}
                        onSaved={() => {
                          setExpandedColor(null);
                          void refreshColors();
                        }}
                        onCancel={() => setExpandedColor(null)}
                      />
                    );
                  }
                  const total = (c.sizes || []).reduce(
                    (sum, s) => sum + (s.stock || 0),
                    0,
                  );
                  const thumb = c.images?.[0];
                  return (
                    <div
                      key={`${c.name}-${i}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: 10,
                        background: "var(--off-white)",
                        borderRadius: "var(--radius)",
                        border: "1px solid var(--gray-200)",
                      }}
                    >
                      {thumb ? (
                        <img
                          src={thumb}
                          alt=""
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 6,
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 6,
                            background: "var(--gray-200)",
                          }}
                        />
                      )}
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: ".85rem",
                            fontWeight: 600,
                            color: "var(--navy)",
                          }}
                        >
                          {c.name}
                          {c.price ? ` • ₹${c.price}` : ""}
                        </div>
                        <div
                          style={{
                            fontSize: ".75rem",
                            color: "var(--gray-500)",
                          }}
                        >
                          {total} in stock • {(c.images || []).length} photo(s)
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline"
                        onClick={() => setExpandedColor(i)}
                      >
                        <i className="fas fa-edit" />
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => void deleteColor(i)}
                      >
                        <i className="fas fa-trash" />
                      </button>
                    </div>
                  );
                })
              )}
              {expandedColor === "new" && (
                <ColorVariantForm
                  productId={product._id}
                  index={null}
                  initial={null}
                  basePrice={Number(price) || 0}
                  onSaved={() => {
                    setExpandedColor(null);
                    void refreshColors();
                  }}
                  onCancel={() => setExpandedColor(null)}
                />
              )}
            </div>
            {expandedColor !== "new" && (
              <button
                type="button"
                className="btn btn-sm btn-outline"
                onClick={() => setExpandedColor("new")}
              >
                <i className="fas fa-plus" /> Add Color
              </button>
            )}
          </div>
        ) : (
          <div className="form-group">
            <p
              style={{
                fontSize: ".82rem",
                color: "var(--gray-500)",
                background: "var(--off-white)",
                padding: 12,
                borderRadius: "var(--radius)",
              }}
            >
              <i
                className="fas fa-info-circle"
                style={{ color: "var(--gold)" }}
              />{" "}
              Save this product first, then you&apos;ll be able to add color
              variants with their own photos and stock.
            </p>
          </div>
        )}
        <div className="form-group">
          <label>Description</label>
          <textarea
            rows={3}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Badge (Optional)</label>
          <input
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
            placeholder="e.g. New, Bestseller, Premium"
          />
        </div>
        <label className="check-row">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
          />
          Show this product on the homepage (Featured)
        </label>
        <div className="form-group">
          <label>Can customers buy this now?</label>
          <div className="choice-grid" style={{ marginTop: 8 }}>
            <button
              type="button"
              className={`choice${!comingSoon ? " on" : ""}`}
              onClick={() => setComingSoon(false)}
            >
              <strong>Yes, on sale</strong>
              <span>Add to cart works as usual</span>
            </button>
            <button
              type="button"
              className={`choice${comingSoon && comingSoonKind === "launch" ? " on" : ""}`}
              onClick={() => {
                setComingSoon(true);
                setComingSoonKind("launch");
              }}
            >
              <strong>Coming soon - new launch</strong>
              <span>Show it, but they cannot buy yet</span>
            </button>
            <button
              type="button"
              className={`choice${comingSoon && comingSoonKind === "restock" ? " on" : ""}`}
              onClick={() => {
                setComingSoon(true);
                setComingSoonKind("restock");
              }}
            >
              <strong>Coming soon - stock on the way</strong>
              <span>Sold out, but more is arriving</span>
            </button>
          </div>
        </div>
        {comingSoon ? (
          <div className="form-group">
            <label>Optional note customers see</label>
            <input
              value={comingSoonNote}
              onChange={(e) => setComingSoonNote(e.target.value)}
              placeholder="e.g. Arriving 25 Aug, or Launching Friday"
            />
          </div>
        ) : null}
        <div className="form-row">
          <div className="form-group">
            <label>Color</label>
            <input
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="e.g. Black & Red"
            />
          </div>
          <div className="form-group">
            <label>Fabric</label>
            <input
              value={fabric}
              onChange={(e) => setFabric(e.target.value)}
              placeholder="e.g. Georgette"
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Size</label>
            <input
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="e.g. Free Size, M to XXL"
            />
          </div>
          <div className="form-group">
            <label>Work</label>
            <input
              value={work}
              onChange={(e) => setWork(e.target.value)}
              placeholder="e.g. Embroidery Work"
            />
          </div>
        </div>
        <div className="form-group">
          <label>Set Includes</label>
          <input
            value={setInclude}
            onChange={(e) => setSetInclude(e.target.value)}
            placeholder="e.g. Kurta, Bottom, Dupatta"
          />
        </div>
        <div className="form-group">
          <label>Reels / Videos (Instagram or YouTube links)</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={videoInput}
              onChange={(e) => setVideoInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addVideo();
                }
              }}
              placeholder="Paste an Instagram reel or YouTube link"
            />
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={addVideo}
            >
              <i className="fas fa-plus" /> Add
            </button>
          </div>
          {videos.length > 0 && (
            <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
              {videos.map((url, i) => (
                <div
                  key={`${url}-${i}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 12px",
                    background: "var(--off-white)",
                    borderRadius: "var(--radius)",
                    border: "1px solid var(--gray-200)",
                  }}
                >
                  <span
                    style={{
                      flex: 1,
                      fontSize: ".8rem",
                      color: "var(--gray-700)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {url}
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() =>
                      setVideos((cur) => cur.filter((_, j) => j !== i))
                    }
                  >
                    <i className="fas fa-trash" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
