import { api, useAsync, type Customer } from "../lib/api.ts";

export function Customers() {
  const {
    data: users,
    error,
    loading,
    reload,
  } = useAsync(() => api<Customer[]>("/users"), []);

  return (
    <div className="tab-content">
      <div className="admin-header">
        <div>
          <h2>Customers</h2>
          <p>View registered customers</p>
        </div>
        <button className="btn btn-outline" onClick={() => void reload()}>
          <i className="fas fa-sync-alt" /> Refresh
        </button>
      </div>
      <div className="admin-section">
        {loading ? (
          <p>Loading…</p>
        ) : error ? (
          <div className="empty-state">
            <p>Failed to load customers</p>
          </div>
        ) : !users?.length ? (
          <div className="empty-state">
            <i className="fas fa-users" />
            <h4>No customers yet</h4>
            <p>Registered customers will appear here</p>
          </div>
        ) : (
          <div className="data-list">
            {users.map((u) => (
              <div className="data-item" key={u._id}>
                <div className="info">
                  <h4>
                    {u.name}{" "}
                    {u.authProvider === "google" ? (
                      <span
                        style={{
                          fontSize: ".7rem",
                          color: "#4285F4",
                          fontWeight: 600,
                        }}
                      >
                        (Google)
                      </span>
                    ) : null}
                  </h4>
                  <p>
                    <i className="fas fa-envelope" style={{ marginRight: 4 }} />{" "}
                    {u.email}
                    {u.phone ? (
                      <>
                        {" "}
                        &nbsp;{" "}
                        <i
                          className="fas fa-phone"
                          style={{ marginRight: 4 }}
                        />{" "}
                        {u.phone}
                      </>
                    ) : null}
                  </p>
                  <p>
                    {u.orderCount || 0} orders • ₹
                    {(u.totalSpent || 0).toLocaleString()} total spent
                    {u.couponsUsed
                      ? ` • ${u.couponsUsed} coupon${u.couponsUsed > 1 ? "s" : ""} used`
                      : ""}
                    {u.createdAt
                      ? ` • Joined ${new Date(u.createdAt).toLocaleDateString("en-IN")}`
                      : ""}
                  </p>
                </div>
                <div className="actions">
                  {u.phone ? (
                    <>
                      <a
                        href={`https://wa.me/${u.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-success"
                      >
                        <i className="fab fa-whatsapp" />
                      </a>
                      <a
                        href={`tel:${u.phone}`}
                        className="btn btn-sm btn-outline"
                      >
                        <i className="fas fa-phone" />
                      </a>
                    </>
                  ) : (
                    <span
                      style={{ fontSize: ".75rem", color: "var(--gray-400)" }}
                    >
                      No phone
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
