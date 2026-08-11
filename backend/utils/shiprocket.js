const axios = require('axios');

const BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

let cachedToken = null;
let tokenExpiry = null;

async function getToken() {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const res = await axios.post(`${BASE_URL}/auth/login`, {
    email: process.env.SHIPROCKET_EMAIL,
    password: process.env.SHIPROCKET_PASSWORD
  });

  cachedToken = res.data.token;
  tokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000;
  return cachedToken;
}

async function createShipment(order) {
  const token = await getToken();

  const orderItems = order.items.map(item => ({
    name: item.name,
    sku: item.id ? item.id.toString() : 'SKU-' + Date.now(),
    units: item.qty,
    selling_price: item.price
  }));

  const payload = {
    order_id: order._id.toString(),
    order_date: new Date(order.createdAt).toISOString().slice(0, 19).replace('T', ' '),
    pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION,
    billing_customer_name: order.customer.name,
    billing_last_name: '',
    billing_address: order.customer.address,
    billing_city: order.customer.city,
    billing_pincode: order.customer.pin,
    billing_state: order.customer.state,
    billing_country: 'India',
    billing_email: order.customer.email || 'noemail@memonclothstore.com',
    billing_phone: order.customer.phone,
    shipping_is_billing: true,
    order_items: orderItems,
    payment_method: order.payment === 'cod' ? 'COD' : 'Prepaid',
    sub_total: order.total,
    length: 25,
    breadth: 20,
    height: 5,
    weight: 0.5
  };

  const res = await axios.post(`${BASE_URL}/orders/create/adhoc`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  });

  return res.data;
}

async function assignAWB(shipmentId) {
  const token = await getToken();
  const res = await axios.post(
    `${BASE_URL}/courier/assign/awb`,
    { shipment_id: shipmentId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}

async function generateLabel(shipmentId) {
  const token = await getToken();
  const res = await axios.post(
    `${BASE_URL}/courier/generate/label`,
    { shipment_id: [shipmentId] },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}

async function createReturnShipment(order) {
  const token = await getToken();

  const orderItems = order.items.map(item => ({
    name: item.name,
    sku: item.id ? item.id.toString() : 'SKU-' + Date.now(),
    units: item.qty,
    selling_price: item.price
  }));

  const payload = {
    order_id: 'RET-' + order._id.toString(),
    order_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
    pickup_customer_name: order.customer.name,
    pickup_last_name: '',
    pickup_address: order.customer.address,
    pickup_city: order.customer.city,
    pickup_pincode: order.customer.pin,
    pickup_state: order.customer.state,
    pickup_country: 'India',
    pickup_email: order.customer.email || 'noemail@memonclothstore.com',
    pickup_phone: order.customer.phone,
    shipping_customer_name: 'Memon Cloth Store',
    shipping_address: 'Shop 1 & 2, Hussain Apt, Near National Urdu Primary School, Ghass Bazar Road',
    shipping_city: 'Kalyan West',
    shipping_country: 'India',
    shipping_pincode: '421301',
    shipping_state: 'Maharashtra',
    shipping_email: 'memonclothstore1978@gmail.com',
    shipping_phone: '8452803023',
    order_items: orderItems,
    payment_method: 'Prepaid',
    sub_total: order.total,
    length: 25,
    breadth: 20,
    height: 5,
    weight: 0.5
  };

  const res = await axios.post(`${BASE_URL}/orders/create/return`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  });

  return res.data;
}

module.exports = { getToken, createShipment, assignAWB, generateLabel, createReturnShipment };