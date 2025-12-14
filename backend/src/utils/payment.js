import Razorpay from "razorpay";

const razorpay = process.env.RAZORPAY_KEY_ID
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

export const createPaymentOrder = async (amount) => {
  if (!razorpay) {
    // Fallback for dev/test without keys if not mocked
    console.warn("Razorpay keys missing. Simulating order.");
    return { id: `order_sim_${Date.now()}`, status: "created" };
  }

  const options = {
    amount: amount * 100,
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  };

  return await razorpay.orders.create(options);
};
