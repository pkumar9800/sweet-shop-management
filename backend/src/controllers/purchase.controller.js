import Sweet from "../models/sweet.model.js";
import Order from "../models/order.model.js";
import { createPaymentOrder } from "../utils/payment.js";

export const purchaseSweet = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity = 1 } = req.body;

    if (quantity <= 0) {
      return res.status(400).json({ message: "Quantity must be positive" });
    }

    // 1. Find Sweet
    const sweet = await Sweet.findById(id);
    if (!sweet) {
      return res.status(404).json({ message: "Sweet not found" });
    }

    // 2. Check Inventory
    if (sweet.quantity === 0) {
      return res.status(400).json({ message: "Out of stock" });
    }
    if (sweet.quantity < quantity) {
      return res
        .status(400)
        .json({ message: `Insufficient stock. Only ${sweet.quantity} left.` });
    }

    // 3. Applying Discount
    let unitPrice = sweet.price;

    if (sweet.discount > 0) {
      const discountAmount = (sweet.price * sweet.discount) / 100;
      unitPrice = sweet.price - discountAmount;
    }

    // 5. Initiate Payment
    const totalPrice = sweet.price * quantity;
    const paymentOrder = await createPaymentOrder(totalPrice);

    // 6. Create Order
    await Order.create({
      user: req.user._id,
      sweet: sweet._id,
      quantity,
      totalPrice,
      razorpayOrderId: paymentOrder.id,
      status: "pending",
    });

    // 5. Decrement Stock
    sweet.quantity -= quantity;
    await sweet.save();

    res.status(200).json({
      message: "Purchase successful",
      orderId: paymentOrder.id,
      amount: totalPrice,
      remainingStock: sweet.quantity,
    });
  } catch (error) {
    console.error("Purchase Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
