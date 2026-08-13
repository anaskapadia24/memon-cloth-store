const nodemailer = require("nodemailer");
const { orderId } = require("./orderId");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  family: 4,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

async function sendOrderConfirmationEmail(order) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log("Email not configured - skipping order confirmation email");
      return;
    }
    if (!order.customer || !order.customer.email) {
      console.log("No customer email on order - skipping confirmation email");
      return;
    }

    const itemsHtml = order.items
      .map(
        (item) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee;">${item.name}${item.size ? " (" + item.size + ")" : ""}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.qty}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">₹${item.price * item.qty}</td>
      </tr>
    `,
      )
      .join("");

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#0a1628;padding:24px;text-align:center;">
          <h1 style="color:#c9a44c;margin:0;font-size:22px;">MEMON CLOTH STORE</h1>
        </div>
        <div style="padding:24px;">
          <h2 style="color:#0a1628;">Thank you for your order!</h2>
          <p>Hi ${order.customer.name || "there"},</p>
          <p>We've received your order and it's being processed. Here are your order details:</p>
          <p style="color:#666;font-size:14px;">Order #${orderId(order)} - ${new Date(order.createdAt || Date.now()).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
          
          <table style="width:100%;border-collapse:collapse;margin-top:16px;">
            <thead>
              <tr style="background:#f4f1ea;">
                <th style="padding:8px;text-align:left;">Item</th>
                <th style="padding:8px;text-align:center;">Qty</th>
                <th style="padding:8px;text-align:right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div style="text-align:right;margin-top:16px;font-size:18px;font-weight:bold;color:#0a1628;">
            Total: ₹${order.total} (${order.payment === "cod" ? "Cash on Delivery" : "Paid Online"})
          </div>

          <div style="margin-top:24px;padding:16px;background:#f4f1ea;border-radius:8px;">
            <strong>Delivery Address:</strong><br>
            ${order.customer.address || ""}<br>
            ${order.customer.phone ? "Phone: " + order.customer.phone : ""}
          </div>

          <p style="margin-top:24px;color:#666;font-size:14px;">
            We'll notify you again once your order ships. If you have any questions, just reply to this email or reach out on WhatsApp.
          </p>
        </div>
        <div style="background:#0a1628;padding:16px;text-align:center;color:#999;font-size:12px;">
          Memon Cloth Store
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Memon Cloth Store" <${process.env.EMAIL_USER}>`,
      to: order.customer.email,
      subject: `Order Confirmed - #${orderId(order)}`,
      html,
    });

    console.log("Order confirmation email sent to", order.customer.email);
  } catch (err) {
    console.error("Failed to send order confirmation email:", err.message);
    // Don't throw - email failure should never block order creation
  }
}

module.exports = { sendOrderConfirmationEmail };
