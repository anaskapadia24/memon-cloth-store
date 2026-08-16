import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="empty-state">
      <i className="fas fa-compass" />
      <h4>Page not found</h4>
      <p>That admin page doesn't exist or may have moved.</p>
      <Link to="/" className="btn btn-primary">
        Back to Dashboard
      </Link>
    </div>
  );
}
