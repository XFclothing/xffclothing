import { Router } from "express";

const router = Router();

function getSupabase() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
  return { url, key };
}

async function sbPost(url: string, key: string, table: string, body: unknown) {
  const res = await fetch(`${url}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  try {
    return { ok: res.ok, status: res.status, data: JSON.parse(text) };
  } catch {
    return { ok: res.ok, status: res.status, data: text };
  }
}

// POST /orders/place — create order + order_items in Supabase
router.post("/orders/place", async (req, res): Promise<void> => {
  const { url, key } = getSupabase();
  if (!url || !key) {
    res.status(500).json({ error: "Supabase config missing" });
    return;
  }

  const { items, shippingAddress, email, customerName, userId, couponCode, totalPrice } = req.body;

  if (!items?.length || !shippingAddress || !email) {
    res.status(400).json({ error: "Missing required fields: items, shippingAddress, email" });
    return;
  }

  const computedTotal =
    typeof totalPrice === "number"
      ? totalPrice
      : (items as { price: number; quantity: number }[]).reduce(
          (sum: number, i: { price: number; quantity: number }) => sum + i.price * i.quantity,
          0,
        );

  // 1. Insert the order
  const orderBody: Record<string, unknown> = {
    status: "pending",
    customer_name: customerName || "",
    email,
    shipping_address: shippingAddress,
    total_price: computedTotal,
  };
  if (userId) orderBody.user_id = userId;
  if (couponCode) orderBody.coupon_code = couponCode;

  const orderResult = await sbPost(url, key, "orders", orderBody);

  if (!orderResult.ok) {
    res.status(500).json({ error: "Failed to create order", detail: orderResult.data });
    return;
  }

  const order = Array.isArray(orderResult.data) ? orderResult.data[0] : orderResult.data;

  // 2. Insert order_items
  const orderItems = (items as { name: string; price: number; quantity: number; size: string; productId?: string }[]).map(
    (item) => ({
      order_id: order.id,
      product_id: item.productId || item.name,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      size: item.size || "",
    }),
  );

  const itemsResult = await sbPost(url, key, "order_items", orderItems);

  if (!itemsResult.ok) {
    // Order was created but items failed — return partial success with warning
    res.status(201).json({ order, warning: "Order created but items could not be saved", detail: itemsResult.data });
    return;
  }

  res.status(201).json({ order });
});

export default router;
