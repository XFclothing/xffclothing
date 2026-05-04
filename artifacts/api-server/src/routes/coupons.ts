import { Router } from "express";

const router = Router();

function getSupabase() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
  return { url, key };
}

async function supabaseGet(path: string) {
  const { url, key } = getSupabase();
  const res = await fetch(`${url}/rest/v1/${path}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
  });
  const text = await res.text();
  return { ok: res.ok, status: res.status, data: text ? JSON.parse(text) : null };
}

async function supabasePatch(path: string, body: object) {
  const { url, key } = getSupabase();
  const res = await fetch(`${url}/rest/v1/${path}`, {
    method: "PATCH",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  return { ok: res.ok, data: text ? JSON.parse(text) : null };
}

// POST /api/coupons/validate
router.post("/coupons/validate", async (req, res): Promise<void> => {
  try {
    const { code } = req.body;

    if (!code) {
      res.status(400).json({ error: "Coupon code is required" });
      return;
    }

    const normalized = code.toUpperCase().trim();
    const { ok, data } = await supabaseGet(
      `coupons?code=eq.${encodeURIComponent(normalized)}&limit=1`
    );

    if (!ok || !data || data.length === 0) {
      res.status(404).json({ valid: false, error: "Invalid coupon code" });
      return;
    }

    const coupon = data[0];

    if (!coupon.active) {
      res.status(400).json({ valid: false, error: "This coupon is no longer active" });
      return;
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      res.status(400).json({ valid: false, error: "This coupon has expired" });
      return;
    }

    if (coupon.usage_limit !== null && coupon.usage_count >= coupon.usage_limit) {
      res.status(400).json({ valid: false, error: "This coupon has reached its usage limit" });
      return;
    }

    res.json({
      valid: true,
      code: coupon.code,
      discountPercent: coupon.discount_percent,
    });
  } catch (err: any) {
    console.error("Coupon validate error:", err);
    res.status(500).json({ valid: false, error: "Failed to validate coupon" });
  }
});

// POST /api/orders/place — place order without payment
router.post("/orders/place", async (req, res): Promise<void> => {
  try {
    const { items, shippingAddress, email, customerName, userId, couponCode, totalPrice } = req.body;

    if (!items || items.length === 0) {
      res.status(400).json({ error: "Cart is empty" });
      return;
    }

    if (!shippingAddress) {
      res.status(400).json({ error: "Shipping address is required" });
      return;
    }

    const { url: supabaseUrl, key: supabaseKey } = getSupabase();

    if (!supabaseUrl || !supabaseKey) {
      res.status(500).json({ error: "Supabase config missing" });
      return;
    }

    const headers = {
      "Content-Type": "application/json",
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      Prefer: "return=representation",
    };

    // Increment coupon usage if a coupon was applied
    if (couponCode) {
      const normalized = couponCode.toUpperCase().trim();
      const { data: couponData } = await supabaseGet(
        `coupons?code=eq.${encodeURIComponent(normalized)}&limit=1`
      );
      if (couponData && couponData.length > 0) {
        const currentCount = couponData[0].usage_count || 0;
        await supabasePatch(
          `coupons?code=eq.${encodeURIComponent(normalized)}`,
          { usage_count: currentCount + 1 }
        );
      }
    }

    // Insert order into Supabase orders table
    const orderRes = await fetch(`${supabaseUrl}/rest/v1/orders`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        user_id: userId || null,
        total_price: totalPrice,
        status: "pending",
        shipping_address: typeof shippingAddress === "string" ? shippingAddress : JSON.stringify(shippingAddress),
      }),
    });

    const orderData = await orderRes.json();
    if (!orderRes.ok) {
      console.error("Supabase order insert error:", orderData);
      res.status(500).json({ error: orderData.message || "Failed to create order" });
      return;
    }

    const order = Array.isArray(orderData) ? orderData[0] : orderData;

    // Insert order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.productId || null,
      name: item.name,
      price: item.price,
      size: item.size,
      quantity: item.quantity,
    }));

    await fetch(`${supabaseUrl}/rest/v1/order_items`, {
      method: "POST",
      headers,
      body: JSON.stringify(orderItems),
    });

    res.json({ order });
  } catch (err: any) {
    console.error("Place order error:", err);
    res.status(500).json({ error: err.message || "Failed to place order" });
  }
});

export default router;
