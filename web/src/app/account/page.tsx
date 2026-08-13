import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getMyOrders } from "@/lib/actions/orders";
import { ProfileForm } from "@/components/account/profile-form";
import { PasswordForm } from "@/components/account/password-form";
import { AddressBook } from "@/components/account/address-book";
import { DangerZone } from "@/components/account/danger-zone";

export const metadata = { title: "My Account" };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  const orders = await getMyOrders();

  return (
    <section className="profile-page">
      <div className="container">
        <div className="profile-grid">
          <div className="profile-sidebar">
            <div className="profile-avatar-large">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h3>{user.name}</h3>
            <p>
              <i className="fas fa-envelope" /> {user.email}
            </p>
            <p>
              <i className="fas fa-phone" /> {user.phone}
            </p>
            <div className="member-since">
              <i className="fas fa-calendar" />{" "}
              {user.createdAt &&
                `Member since ${new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}`}
              <br />
              {orders.length} orders placed
            </div>
          </div>

          <div className="profile-content">
            <h2>Account Settings</h2>

            <div className="profile-section">
              <h3>
                <i className="fas fa-user" /> Personal Information
              </h3>
              <ProfileForm user={user} />
            </div>

            <div className="profile-section">
              <h3>
                <i className="fas fa-lock" /> Change Password
              </h3>
              <PasswordForm />
            </div>

            <div className="profile-section">
              <h3>
                <i className="fas fa-map-marker-alt" /> Saved Addresses
              </h3>
              <AddressBook addresses={user.addresses || []} />
            </div>

            <div className="profile-section danger">
              <h3>
                <i className="fas fa-exclamation-triangle" /> Danger Zone
              </h3>
              <DangerZone />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
