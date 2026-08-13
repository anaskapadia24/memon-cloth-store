"use client";

import { useState, useTransition } from "react";
import { addAddressAction, deleteAddressAction } from "@/lib/actions/auth";
import type { Address } from "@/lib/types";

export function AddressBook({ addresses: initial }: { addresses: Address[] }) {
  const [addresses, setAddresses] = useState(initial);
  const [label, setLabel] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await addAddressAction(label, address);
      if (result.ok) {
        setAddresses(result.data);
        setLabel("");
        setAddress("");
      } else {
        setError(result.error);
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteAddressAction(id);
      if (result.ok) setAddresses(result.data);
    });
  }

  return (
    <div>
      {addresses.length === 0 ? (
        <p style={{ color: "var(--gray-500)", fontSize: "0.9rem" }}>
          No saved addresses yet
        </p>
      ) : (
        addresses.map((addr) => (
          <div key={addr._id} className="saved-address">
            <div>
              <strong>{addr.label}</strong>
              <p>{addr.address}</p>
            </div>
            <button
              onClick={() => handleDelete(addr._id)}
              aria-label={`Delete ${addr.label} address`}
            >
              <i className="fas fa-trash" />
            </button>
          </div>
        ))
      )}

      <form onSubmit={handleAdd} style={{ marginTop: 16 }}>
        <div className="form-group">
          <label>Address Label (e.g., Home, Office)</label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Home"
            required
          />
        </div>
        <div className="form-group">
          <label>Full Address</label>
          <textarea
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="House no., Street, Area, City, PIN"
            required
          />
        </div>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={isPending}>
          <i className="fas fa-plus" />{" "}
          {isPending ? "Saving..." : "Add Address"}
        </button>
      </form>
    </div>
  );
}
