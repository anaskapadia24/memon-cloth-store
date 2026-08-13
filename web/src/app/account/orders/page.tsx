import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { getMyOrders } from "@/lib/actions/orders";
import { OrderCard } from "@/components/account/order-card";

export const metadata = { title: "My Orders" };

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account/orders");

  const orders = await getMyOrders();

  return (
    <section className="cart-page">
      <div className="container">
        {orders.length === 0 ? (
          <div className="cart-empty">
            <i className="fas fa-box" />
            <h4>No orders yet</h4>
            <p>You haven&apos;t placed any orders yet.</p>
            <Link href="/category/all" className="btn btn-primary">
              <i className="fas fa-th-large" /> Browse Products
            </Link>
          </div>
        ) : (
          <>
            <h1 className="section-title" style={{ marginBottom: 32 }}>
              My Orders
            </h1>
            <div style={{ maxWidth: 720 }}>
              {orders.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
