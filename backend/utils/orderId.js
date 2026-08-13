function orderId(order) {
  return order._id.toString().slice(-8).toUpperCase();
}

module.exports = { orderId };
