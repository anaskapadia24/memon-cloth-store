import Link from "next/link";

export default function NotFound() {
  return (
    <section className="cart-page">
      <div className="container">
        <div className="cart-empty">
          <i className="fas fa-compass" />
          <h4>Page not found</h4>
          <p>The page you're looking for doesn't exist or has moved.</p>
          <Link href="/" className="btn btn-primary">
            <i className="fas fa-home" /> Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
}
