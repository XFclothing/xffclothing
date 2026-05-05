import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { X, Plus, Trash2, Package } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase, Order, Ticket, TicketMessage, Admin } from "@/lib/supabase";
import { useStoreSettings } from "@/context/StoreSettingsContext";
import { products } from "@/data/products";

const STATUSES = ["pending", "processing", "shipped", "completed"] as const;
type OrderStatus = (typeof STATUSES)[number];

const CARRIERS = ["DHL", "UPS", "FedEx", "DPD", "GLS", "Hermes", "Andere"] as const;

const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: "text-yellow-400/80 border-yellow-400/30",
  processing: "text-blue-400/80 border-blue-400/30",
  shipped: "text-purple-400/80 border-purple-400/30",
  delivered: "text-teal-400/80 border-teal-400/30",
  completed: "text-green-400/80 border-green-400/30",
};

const TICKET_STATUS_COLORS: Record<string, string> = {
  open: "text-yellow-400/80",
  answered: "text-green-400/80",
  closed: "text-foreground/30",
};

const DEFAULT_PERMS = { view_orders: true, manage_orders: false, manage_tickets: false };

export default function Founder() {
  const { role, loading } = useAuth();
  const [, navigate] = useLocation();
  const { comingSoon, setComingSoon, outOfStock, toggleOutOfStock, loaded: settingsLoaded } = useStoreSettings();
  const [tab, setTab] = useState<"workers" | "orders" | "delivered" | "old_orders" | "tickets" | "notify" | "shop">("workers");

  // Workers
  const [workers, setWorkers] = useState<Admin[]>([]);
  const [workersLoading, setWorkersLoading] = useState(true);
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [newWorkerName, setNewWorkerName] = useState("");
  const [newWorkerEmail, setNewWorkerEmail] = useState("");
  const [addingWorker, setAddingWorker] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [confirmRemoveWorker, setConfirmRemoveWorker] = useState<Admin | null>(null);
  const [removingWorker, setRemovingWorker] = useState(false);

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "all">("all");
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [activeOldOrder, setActiveOldOrder] = useState<Order | null>(null);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [founderCancelOrderId, setFounderCancelOrderId] = useState<string | null>(null);
  const [founderCancelReason, setFounderCancelReason] = useState("");
  const [founderCancelling, setFounderCancelling] = useState(false);
  const [founderCancelError, setFounderCancelError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Shipping modal
  const [shippingOrder, setShippingOrder] = useState<Order | null>(null);
  const [trackingCode, setTrackingCode] = useState("");
  const [logisticsProvider, setLogisticsProvider] = useState<string>(CARRIERS[0]);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);

  // Tickets
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [ticketMessages, setTicketMessages] = useState<TicketMessage[]>([]);
  const [reply, setReply] = useState("");
  const [replying, setReplying] = useState(false);

  // Notify
  const [notifySubject, setNotifySubject] = useState("The Drop is Live — XF Unseen Collection");
  const [notifyMessage, setNotifyMessage] = useState(
    "You signed up to be the first to know.\n\nThe wait is over.\n\nThe XF Unseen Collection by Xavier & Fynn is officially live. Limited pieces, no restock.\n\nShop now before it's gone.\n\n— Xavier & Fynn\nxf-store.com"
  );
  const [notifySending, setNotifySending] = useState(false);
  const [notifyResult, setNotifyResult] = useState<{ ok: boolean; sent?: number; error?: string } | null>(null);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && role !== "founder") navigate("/login");
    if (!loading && role === "founder") {
      fetchWorkers();
      fetchOrders();
      fetchTickets();
      fetchSubscriberCount();
    }
  }, [role, loading]);

  async function fetchSubscriberCount() {
    const { count } = await supabase.from("notify_emails").select("*", { count: "exact", head: true });
    setSubscriberCount(count ?? 0);
  }

  async function sendNotification() {
    if (!notifySubject.trim() || !notifyMessage.trim()) return;
    setNotifySending(true);
    setNotifyResult(null);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${baseUrl}/api/email/notify-subscribers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: notifySubject.trim(), message: notifyMessage.trim() }),
      });
      const data = await res.json();
      setNotifyResult(data);
      if (data.ok) {
        setNotifySubject("");
        setNotifyMessage("");
        fetchSubscriberCount();
      }
    } catch (err: any) {
      setNotifyResult({ ok: false, error: err.message });
    }
    setNotifySending(false);
  }

  async function fetchWorkers() {
    setWorkersLoading(true);
    const { data, error } = await supabase.from("admins").select("*").order("name", { ascending: true });
    if (error) console.error("fetchWorkers error:", error);
    setWorkers((data as Admin[]) || []);
    setWorkersLoading(false);
  }

  async function fetchOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });
    if (error) { console.error("[Founder] fetchOrders error:", error.message); setOrdersLoading(false); return; }
    const rawOrders = (data as Order[]) || [];
    // Fetch profiles for all orders that have a user_id
    const userIds = [...new Set(rawOrders.map((o) => o.user_id).filter(Boolean))];
    let profileMap: Record<string, any> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase.from("profiles").select("*").in("id", userIds);
      if (profiles) {
        profiles.forEach((p: any) => { profileMap[p.id] = p; });
      }
    }
    const ordersWithProfiles = rawOrders.map((o) => ({
      ...o,
      profiles: o.user_id ? profileMap[o.user_id] ?? null : null,
    }));
    // Auto-delete cancelled orders that moved to old_orders and are older than 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const toDelete = ordersWithProfiles.filter(
      (o) => o.status === "old_orders" && (o as any).cancellation_reason && o.created_at < oneHourAgo
    );
    if (toDelete.length > 0) {
      await supabase.from("order_items").delete().in("order_id", toDelete.map((o) => o.id));
      await supabase.from("orders").delete().in("id", toDelete.map((o) => o.id));
    }
    setOrders(ordersWithProfiles.filter((o) => !toDelete.find((d) => d.id === o.id)) as Order[]);
    setOrdersLoading(false);
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  async function founderCancelOrder() {
    if (!founderCancelOrderId || !founderCancelReason.trim()) return;
    setFounderCancelling(true);
    setFounderCancelError(null);
    const cancelledOrder = orders.find((o) => o.id === founderCancelOrderId);
    const { error } = await supabase
      .from("orders")
      .update({ status: "cancelled", cancellation_reason: founderCancelReason.trim() })
      .eq("id", founderCancelOrderId);
    setFounderCancelling(false);
    if (error) { setFounderCancelError(error.message); return; }
    setOrders((prev) =>
      prev.map((o) =>
        o.id === founderCancelOrderId
          ? { ...o, status: "cancelled" as any, cancellation_reason: founderCancelReason.trim() }
          : o
      )
    );
    setActiveOrder((prev) =>
      prev && prev.id === founderCancelOrderId
        ? { ...prev, status: "cancelled" as any, cancellation_reason: founderCancelReason.trim() }
        : prev
    );
    // Move to old_orders so it appears in Old Orders tab
    await supabase.from("orders").update({ status: "old_orders" }).eq("id", founderCancelOrderId);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === founderCancelOrderId ? { ...o, status: "old_orders" as any } : o
      )
    );
    setActiveOrder((prev) =>
      prev && prev.id === founderCancelOrderId ? { ...prev, status: "old_orders" as any } : prev
    );
    // Send cancellation email to customer
    if (cancelledOrder) {
      try {
        const profile = (cancelledOrder as any).profiles;
        const email = profile?.email;
        const name = profile?.name || "";
        if (email) {
          const baseUrl = import.meta.env.VITE_API_URL || "";
          await fetch(`${baseUrl}/api/email/cancel`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              customerEmail: email,
              customerName: name,
              orderId: cancelledOrder.id,
              reason: founderCancelReason.trim(),
              items: cancelledOrder.order_items || [],
              total: cancelledOrder.total_price,
            }),
          });
        } else {
          // Fallback: fetch profile if not already loaded
          const { data: profileData } = await supabase
            .from("profiles")
            .select("email, name")
            .eq("id", cancelledOrder.user_id)
            .single();
          if (profileData?.email) {
            const baseUrl = import.meta.env.VITE_API_URL || "";
            await fetch(`${baseUrl}/api/email/cancel`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                customerEmail: profileData.email,
                customerName: profileData.name || "",
                orderId: cancelledOrder.id,
                reason: founderCancelReason.trim(),
                items: cancelledOrder.order_items || [],
                total: cancelledOrder.total_price,
              }),
            });
          }
        }
      } catch (e) {
        console.error("Cancel email failed:", e);
      }
    }
    setFounderCancelOrderId(null);
    setFounderCancelReason("");
    setActiveOrder(null);
  }

  async function fetchTickets() {
    const { data } = await supabase
      .from("tickets")
      .select("*")
      .order("created_at", { ascending: false });
    setTickets((data as Ticket[]) || []);
    setTicketsLoading(false);
  }

  async function addWorker() {
    if (!newWorkerName.trim() || !newWorkerEmail.trim()) return;
    setAddingWorker(true);
    setAddError(null);
    const { error } = await supabase.from("admins").insert({
      name: newWorkerName.trim(),
      email: newWorkerEmail.trim().toLowerCase(),
      role: "worker",
      permissions: DEFAULT_PERMS,
    });
    if (error) {
      setAddError(error.message.includes("unique") ? "This email is already a worker." : error.message);
      setAddingWorker(false);
      return;
    }
    await fetchWorkers();
    setNewWorkerName("");
    setNewWorkerEmail("");
    setShowAddWorker(false);
    setAddingWorker(false);
  }

  async function confirmAndRemoveWorker() {
    if (!confirmRemoveWorker) return;
    setRemovingWorker(true);
    await supabase.from("admins").delete().eq("id", confirmRemoveWorker.id);
    setWorkers((prev) => prev.filter((w) => w.id !== confirmRemoveWorker.id));
    setRemovingWorker(false);
    setConfirmRemoveWorker(null);
  }

  async function updatePermissions(id: string, key: keyof Admin["permissions"], value: boolean) {
    const worker = workers.find((w) => w.id === id);
    if (!worker) return;
    const newPerms = { ...(worker.permissions || DEFAULT_PERMS), [key]: value };
    await supabase.from("admins").update({ permissions: newPerms }).eq("id", id);
    setWorkers((prev) => prev.map((w) => w.id === id ? { ...w, permissions: newPerms } : w));
  }

  function handleStatusChange(order: Order, status: OrderStatus) {
    if (status === "shipped") {
      setShippingOrder(order);
      setTrackingCode("");
      setLogisticsProvider(CARRIERS[0]);
      setShippingError(null);
    } else {
      doUpdateOrderStatus(order.id, status);
    }
  }

  async function doUpdateOrderStatus(orderId: string, status: OrderStatus, extra?: { tracking_code: string; logistics_provider: string }) {
    setUpdatingOrder(orderId);
    await supabase.from("orders").update({ status, ...extra }).eq("id", orderId);
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status, ...(extra || {}) } : o));
    setUpdatingOrder(null);
  }

  async function confirmShipping() {
    if (!shippingOrder || !trackingCode.trim()) {
      setShippingError("Bitte Tracking-Code eingeben.");
      return;
    }
    setShippingLoading(true);
    setShippingError(null);

    const { data: profileData } = await supabase
      .from("profiles")
      .select("email, name")
      .eq("id", shippingOrder.user_id)
      .single();

    await doUpdateOrderStatus(shippingOrder.id, "shipped", {
      tracking_code: trackingCode.trim(),
      logistics_provider: logisticsProvider,
    });

    if (profileData?.email) {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || "";
        await fetch(`${baseUrl}/api/email/shipping`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerEmail: profileData.email,
            customerName: profileData.name || "",
            orderId: shippingOrder.id,
            trackingCode: trackingCode.trim(),
            logisticsProvider,
            items: shippingOrder.order_items || [],
            total: shippingOrder.total_price,
            shippingAddress: shippingOrder.shipping_address,
          }),
        });
      } catch (e) {
        console.error("Shipping email failed:", e);
      }
    }

    setShippingLoading(false);
    setShippingOrder(null);
  }

  async function openTicket(ticket: Ticket) {
    const { data } = await supabase
      .from("ticket_messages")
      .select("*")
      .eq("ticket_id", ticket.id)
      .order("created_at", { ascending: true });
    setTicketMessages((data as TicketMessage[]) || []);
    setActiveTicket(ticket);
  }

  async function sendReply() {
    if (!reply.trim() || !activeTicket) return;
    setReplying(true);
    const { data } = await supabase
      .from("ticket_messages")
      .insert({ ticket_id: activeTicket.id, sender_role: "worker", message: reply.trim() })
      .select().single();
    if (data) {
      setTicketMessages((prev) => [...prev, data as TicketMessage]);
      await supabase.from("tickets").update({ status: "answered" }).eq("id", activeTicket.id);
      setTickets((prev) => prev.map((t) => t.id === activeTicket.id ? { ...t, status: "answered" } : t));
      setActiveTicket((prev) => prev ? { ...prev, status: "answered" } : prev);
    }
    setReply("");
    setReplying(false);
  }

  async function updateTicketStatus(status: string) {
    if (!activeTicket) return;
    await supabase.from("tickets").update({ status }).eq("id", activeTicket.id);
    setTickets((prev) => prev.map((t) => t.id === activeTicket.id ? { ...t, status: status as Ticket["status"] } : t));
    setActiveTicket((prev) => prev ? { ...prev, status: status as Ticket["status"] } : prev);
  }

  const activeOrders = orders.filter((o) => o.status !== "delivered" && o.status !== "old_orders" && o.status !== "completed");
  const deliveredOrders = orders.filter((o) => o.status === "delivered" || o.status === "completed");
  const oldOrders = orders.filter((o) => o.status === "old_orders");
  const filteredOrders = filterStatus === "all" ? activeOrders : activeOrders.filter((o) => o.status === filterStatus);

  async function confirmDelivery(orderId: string) {
    await supabase.from("orders").update({ status: "old_orders" }).eq("id", orderId);
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: "old_orders" } : o));
  }

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-5 h-5 border border-foreground/20 border-t-foreground/60 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background pt-28 pb-24">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>

          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[10px] uppercase tracking-[0.5em] text-foreground/30 mb-2">Full Access</p>
              <h1 className="text-4xl font-bold uppercase tracking-widest text-foreground">Founder Panel</h1>
            </div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-foreground/20 pb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-foreground/30" />
              XF
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-foreground/10 mb-10 flex-wrap">
            {(["workers", "orders", "delivered", "old_orders", "tickets", "notify", "shop"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-6 py-3 text-xs uppercase tracking-[0.4em] transition-colors border-b-2 -mb-px ${
                  tab === t ? "border-white text-foreground" : "border-transparent text-foreground/30 hover:text-foreground/60"
                }`}
              >
                {t === "workers" && <>Workers <span className="text-foreground/30">({workers.length})</span></>}
                {t === "orders" && <>Orders <span className="text-foreground/30">({activeOrders.length})</span></>}
                {t === "delivered" && <>Delivered <span className="text-teal-400/50">({deliveredOrders.length})</span></>}
                {t === "old_orders" && <>Old Orders <span className="text-foreground/25">({oldOrders.length})</span></>}
                {t === "tickets" && <>Tickets <span className="text-foreground/30">({tickets.filter(tk => tk.status === "open").length})</span></>}
                {t === "notify" && <>Notify <span className="text-foreground/30">({subscriberCount ?? "…"})</span></>}
                {t === "shop" && <>Shop {comingSoon && <span className="text-orange-400/60 ml-1">● Live</span>}</>}
              </button>
            ))}
          </div>

          {/* Workers Tab */}
          {tab === "workers" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <p className="text-xs text-foreground/30 uppercase tracking-widest">{workers.length} workers</p>
                <button
                  onClick={() => setShowAddWorker(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-foreground/20 text-xs uppercase tracking-[0.35em] text-foreground/60 hover:text-foreground hover:border-foreground/50 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Add Worker
                </button>
              </div>

              {workersLoading ? (
                <div className="flex justify-center py-16"><div className="w-5 h-5 border border-foreground/20 border-t-foreground/60 rounded-full animate-spin" /></div>
              ) : workers.length === 0 ? (
                <p className="text-foreground/25 text-xs uppercase tracking-widest py-12 text-center">No workers yet</p>
              ) : (
                <div className="space-y-4">
                  {workers.map((worker) => {
                    const perms = worker.permissions || DEFAULT_PERMS;
                    return (
                      <div key={worker.id} className="border border-foreground/8 p-6">
                        <div className="flex items-start justify-between gap-4 mb-5">
                          <div>
                            <p className="text-foreground font-medium">{worker.name}</p>
                            <p className="text-xs text-foreground/40 mt-1">{worker.email}</p>
                            <span className="text-[10px] uppercase tracking-widest text-foreground/25 mt-1 inline-block">{worker.role}</span>
                          </div>
                          <button
                            onClick={() => setConfirmRemoveWorker(worker)}
                            className="text-foreground/20 hover:text-red-400/70 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="border-t border-foreground/5 pt-4">
                          <p className="text-[10px] uppercase tracking-[0.4em] text-foreground/30 mb-3">Permissions</p>
                          <div className="flex flex-wrap gap-3">
                            {(Object.keys(DEFAULT_PERMS) as (keyof typeof DEFAULT_PERMS)[]).map((key) => (
                              <label key={key} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={!!perms[key]}
                                  onChange={(e) => updatePermissions(worker.id, key, e.target.checked)}
                                  className="accent-white w-3.5 h-3.5"
                                />
                                <span className="text-[10px] uppercase tracking-widest text-foreground/50">
                                  {key.replace(/_/g, " ")}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {tab === "orders" && (
            <div>
              <div className="flex gap-2 flex-wrap mb-8">
                {(["all", ...STATUSES] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-4 py-2 text-[10px] uppercase tracking-[0.35em] border transition-colors ${
                      filterStatus === s ? "border-foreground/50 text-foreground" : "border-foreground/10 text-foreground/30 hover:text-foreground/60 hover:border-foreground/25"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <p className="text-xs text-foreground/30 uppercase tracking-widest mb-6">{filteredOrders.length} orders</p>
              {ordersLoading ? (
                <div className="flex justify-center py-16"><div className="w-5 h-5 border border-foreground/20 border-t-foreground/60 rounded-full animate-spin" /></div>
              ) : filteredOrders.length === 0 ? (
                <p className="text-foreground/25 text-xs uppercase tracking-widest py-12 text-center">No orders</p>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="border border-foreground/8 p-6 hover:border-foreground/20 transition-colors">
                      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                        <button
                          className="flex-1 min-w-0 text-left"
                          onClick={() => setActiveOrder(order)}
                        >
                          <div className="flex items-center gap-4 mb-2 flex-wrap">
                            <span className="text-foreground font-semibold text-sm">${order.total_price.toFixed(2)}</span>
                            <span className="text-foreground/25 text-xs">{new Date(order.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                          {(order as any).profiles && (
                            <p className="text-xs text-foreground/60 mb-1">{(order as any).profiles.name} · {(order as any).profiles.email}</p>
                          )}
                          <p className="text-xs text-foreground/35 tracking-wide mb-3">{order.shipping_address}</p>
                          {order.order_items && (
                            <div className="space-y-1">
                              {order.order_items.map((item) => (
                                <p key={item.id} className="text-xs text-foreground/45">
                                  {item.name} · {item.size} · ×{item.quantity} · ${(item.price * item.quantity).toFixed(2)}
                                </p>
                              ))}
                            </div>
                          )}
                        </button>
                        <div className="flex-shrink-0 flex flex-col gap-2">
                          <span className={`text-[10px] uppercase tracking-[0.35em] px-3 py-1.5 border ${ORDER_STATUS_COLORS[order.status] || "text-foreground/50 border-foreground/20"} text-center`}>
                            {order.status}
                          </span>
                          {order.status === "shipped" && order.tracking_code && (
                            <div className="text-[9px] text-foreground/30 text-right">
                              <span className="uppercase tracking-widest">{order.logistics_provider}</span><br />
                              <span className="font-mono">{order.tracking_code}</span>
                            </div>
                          )}
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order, e.target.value as OrderStatus)}
                            disabled={updatingOrder === order.id}
                            className="bg-foreground/5 border border-foreground/10 text-foreground/60 text-xs px-3 py-2 outline-none cursor-pointer hover:border-foreground/25 transition-colors disabled:opacity-50"
                          >
                            {STATUSES.map((s) => <option key={s} value={s} className="bg-background">{s}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Delivered Orders Tab */}
          {tab === "delivered" && (
            <div>
              <p className="text-xs text-foreground/30 uppercase tracking-widest mb-6">{deliveredOrders.length} delivered orders</p>
              {ordersLoading ? (
                <div className="flex justify-center py-16"><div className="w-5 h-5 border border-foreground/20 border-t-foreground/60 rounded-full animate-spin" /></div>
              ) : deliveredOrders.length === 0 ? (
                <p className="text-foreground/25 text-xs uppercase tracking-widest py-12 text-center">No delivered orders</p>
              ) : (
                <div className="space-y-4">
                  {deliveredOrders.map((order) => (
                    <div key={order.id} className="border border-teal-400/15 p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-4 mb-2 flex-wrap">
                            <span className="text-foreground font-semibold text-sm">${order.total_price.toFixed(2)}</span>
                            <span className="text-foreground/25 text-xs">{new Date(order.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                          <p className="text-xs text-foreground/35 tracking-wide mb-3">{order.shipping_address}</p>
                          {order.order_items && (
                            <div className="space-y-1">
                              {order.order_items.map((item) => (
                                <p key={item.id} className="text-xs text-foreground/45">
                                  {item.name} · {item.size} · ×{item.quantity} · ${(item.price * item.quantity).toFixed(2)}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex-shrink-0 flex flex-col gap-2 items-end">
                          <span className="text-[10px] uppercase tracking-[0.35em] px-3 py-1.5 border text-teal-400/80 border-teal-400/30 text-center">
                            Delivered by customer
                          </span>
                          <button
                            onClick={() => confirmDelivery(order.id)}
                            className="text-[10px] uppercase tracking-[0.35em] px-4 py-2 bg-foreground/10 text-foreground/70 hover:bg-foreground/20 hover:text-foreground transition-colors border border-foreground/10"
                          >
                            Confirm &amp; Complete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Old Orders Tab */}
          {tab === "old_orders" && (
            <div>
              <p className="text-xs text-foreground/30 uppercase tracking-widest mb-6">{oldOrders.length} old orders</p>
              {ordersLoading ? (
                <div className="flex justify-center py-16"><div className="w-5 h-5 border border-foreground/20 border-t-foreground/60 rounded-full animate-spin" /></div>
              ) : oldOrders.length === 0 ? (
                <p className="text-foreground/25 text-xs uppercase tracking-widest py-12 text-center">No old orders</p>
              ) : (
                <div className="space-y-3">
                  {oldOrders.map((order) => (
                    <button
                      key={order.id}
                      onClick={() => setActiveOldOrder(order)}
                      className="w-full border border-foreground/8 p-5 text-left hover:border-foreground/20 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-foreground/30 uppercase tracking-widest">{new Date(order.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</p>
                          <p className="text-foreground/70 font-semibold mt-1">${order.total_price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] uppercase tracking-[0.35em] text-foreground/30">Old Order</span>
                          <span className="text-foreground/15 group-hover:text-foreground/40 transition-colors text-xs">›</span>
                        </div>
                      </div>
                      {order.order_items && order.order_items.length > 0 && (
                        <p className="text-xs text-foreground/25 mt-2">{order.order_items.map(i => i.name).join(", ")}</p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Notify Tab */}
          {tab === "notify" && (
            <div className="max-w-xl">
              <div className="mb-8">
                <p className="text-[10px] uppercase tracking-[0.5em] text-foreground/30 mb-1">Newsletter</p>
                <p className="text-foreground/60 text-sm">
                  {subscriberCount !== null ? (
                    <><span className="text-foreground font-semibold">{subscriberCount}</span> subscriber{subscriberCount !== 1 ? "s" : ""} will receive this email.</>
                  ) : "Loading subscribers…"}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.4em] text-foreground/30 mb-2 block">Subject</label>
                  <input
                    type="text"
                    value={notifySubject}
                    onChange={(e) => setNotifySubject(e.target.value)}
                    placeholder="Launch is here — Shop now"
                    className="w-full bg-transparent border border-foreground/15 text-foreground placeholder-foreground/20 px-4 py-3 text-sm outline-none focus:border-foreground/40 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-[0.4em] text-foreground/30 mb-2 block">Message</label>
                  <textarea
                    value={notifyMessage}
                    onChange={(e) => setNotifyMessage(e.target.value)}
                    placeholder="The wait is over. The XF Unseen Collection is officially live…"
                    rows={6}
                    className="w-full bg-transparent border border-foreground/15 text-foreground placeholder-foreground/20 px-4 py-3 text-sm outline-none focus:border-foreground/40 transition-colors resize-none"
                  />
                </div>

                {notifyResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`px-4 py-3 text-xs uppercase tracking-[0.35em] border ${
                      notifyResult.ok
                        ? "border-green-400/30 text-green-400/80"
                        : "border-red-400/30 text-red-400/80"
                    }`}
                  >
                    {notifyResult.ok
                      ? `Sent to ${notifyResult.sent} subscriber${notifyResult.sent !== 1 ? "s" : ""}`
                      : `Error: ${notifyResult.error}`}
                  </motion.div>
                )}

                <button
                  onClick={sendNotification}
                  disabled={notifySending || !notifySubject.trim() || !notifyMessage.trim() || subscriberCount === 0}
                  className="w-full py-3.5 text-[11px] uppercase tracking-[0.5em] bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {notifySending ? "Sending…" : `Send to ${subscriberCount ?? "…"} Subscribers`}
                </button>
              </div>
            </div>
          )}

          {/* Tickets Tab */}
          {tab === "tickets" && (
            <div>
              {ticketsLoading ? (
                <div className="flex justify-center py-16"><div className="w-5 h-5 border border-foreground/20 border-t-foreground/60 rounded-full animate-spin" /></div>
              ) : tickets.length === 0 ? (
                <p className="text-foreground/25 text-xs uppercase tracking-widest py-12 text-center">No tickets</p>
              ) : (
                <div className="space-y-3">
                  {tickets.map((ticket) => (
                    <button key={ticket.id} onClick={() => openTicket(ticket)}
                      className="w-full border border-foreground/8 p-5 text-left hover:border-foreground/20 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground font-medium truncate">{ticket.subject}</p>
                          <p className="text-xs text-foreground/40 mt-1">{(ticket as any).profiles?.name} · {(ticket as any).profiles?.email}</p>
                          <p className="text-xs text-foreground/25 mt-1">{new Date(ticket.created_at).toLocaleDateString()}</p>
                        </div>
                        <span className={`text-[10px] uppercase tracking-widest flex-shrink-0 ${TICKET_STATUS_COLORS[ticket.status]}`}>{ticket.status}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Shop Tab */}
          {tab === "shop" && (
            <div className="space-y-10">

              {/* Coming Soon Global Toggle */}
              <div className="border border-foreground/10 p-6">
                <div className="flex items-center justify-between gap-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-foreground mb-1">Coming Soon Mode</p>
                    <p className="text-[11px] text-foreground/35 leading-relaxed">
                      When active, all products show "Coming Soon" and cannot be added to the cart.
                    </p>
                  </div>
                  <button
                    onClick={() => settingsLoaded && setComingSoon(!comingSoon)}
                    disabled={!settingsLoaded}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 flex-shrink-0 disabled:opacity-40 ${
                      comingSoon ? "bg-orange-400/80" : "bg-foreground/15"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${
                        comingSoon ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
                {comingSoon && (
                  <p className="text-[10px] uppercase tracking-[0.4em] text-orange-400/70 mt-4">
                    ● Coming Soon mode is active — shop is locked
                  </p>
                )}
              </div>

              {/* Per-Product Out of Stock */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.5em] text-foreground/30 mb-5">
                  Individual Products — Out of Stock
                </p>
                <div className="space-y-2">
                  {products.map((product) => {
                    const isOos = outOfStock.includes(product.id);
                    return (
                      <div
                        key={product.id}
                        className={`flex items-center justify-between gap-4 px-5 py-4 border transition-colors ${
                          isOos ? "border-foreground/20 bg-foreground/3" : "border-foreground/6"
                        }`}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <img
                            src={product.image}
                            alt={product.name}
                            className={`w-10 h-12 object-cover flex-shrink-0 ${isOos ? "opacity-40" : ""}`}
                          />
                          <div className="min-w-0">
                            <p className={`text-sm font-medium truncate ${isOos ? "text-foreground/40" : "text-foreground"}`}>
                              {product.name}
                            </p>
                            <p className="text-[10px] uppercase tracking-widest text-foreground/25 mt-0.5">
                              €{product.price}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {isOos && (
                            <span className="text-[10px] uppercase tracking-[0.35em] text-foreground/30">
                              Out of Stock
                            </span>
                          )}
                          <button
                            onClick={() => settingsLoaded && toggleOutOfStock(product.id)}
                            disabled={!settingsLoaded || comingSoon}
                            className={`relative w-10 h-5 rounded-full transition-colors duration-300 disabled:opacity-30 ${
                              isOos ? "bg-foreground/50" : "bg-foreground/12"
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300 ${
                                isOos ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {comingSoon && (
                  <p className="text-[10px] text-foreground/25 uppercase tracking-widest mt-4">
                    Individual stock controls are disabled while Coming Soon mode is active.
                  </p>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Order Detail Modal (Founder) */}
      <AnimatePresence>
        {activeOrder && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setActiveOrder(null)}
              className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm" />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-lg bg-card border border-foreground/10 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-foreground/8">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.5em] text-foreground/25 mb-1">Order Details</p>
                    <p className="text-[10px] text-foreground/20 font-mono">{activeOrder.id.split("-")[0].toUpperCase()}</p>
                  </div>
                  <button onClick={() => setActiveOrder(null)} className="text-foreground/30 hover:text-foreground transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="px-8 py-6 space-y-6">
                  {/* Status + Date */}
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.4em] text-foreground/25 mb-2">Placed on</p>
                      <p className="text-sm text-foreground/70">{new Date(activeOrder.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                      <p className="text-xs text-foreground/30 mt-0.5">{new Date(activeOrder.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] uppercase tracking-[0.4em] text-foreground/25 mb-2">Status</p>
                      <span className={`text-xs uppercase tracking-widest font-semibold ${ORDER_STATUS_COLORS[activeOrder.status] || "text-foreground/50"}`}>{activeOrder.status}</span>
                    </div>
                  </div>

                  {/* User Info */}
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.4em] text-foreground/25 mb-3">Customer</p>
                    <div className="bg-foreground/3 border border-foreground/6 px-4 py-3 space-y-2">
                      {(activeOrder as any).profiles ? (
                        <>
                          <p className="text-sm text-foreground/70">{(activeOrder as any).profiles.name}</p>
                          <p className="text-xs text-foreground/40">{(activeOrder as any).profiles.email}</p>
                        </>
                      ) : (
                        <p className="text-xs text-foreground/30 italic">No profile linked</p>
                      )}
                      <div className="flex items-center gap-2 pt-1 border-t border-foreground/6">
                        <p className="text-[9px] uppercase tracking-[0.35em] text-foreground/25">User ID</p>
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <span className="text-[10px] text-foreground/30 font-mono truncate">{activeOrder.user_id || "—"}</span>
                          {activeOrder.user_id && (
                            <button
                              onClick={() => copyToClipboard(activeOrder.user_id!, `uid-${activeOrder.id}`)}
                              className="flex-shrink-0 text-foreground/20 hover:text-foreground/60 transition-colors"
                            >
                              {copiedId === `uid-${activeOrder.id}` ? (
                                <span className="text-[9px] text-green-400/70 uppercase tracking-widest">Copied</span>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                                </svg>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order ID */}
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.4em] text-foreground/25 mb-2">Order ID</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-foreground/30 font-mono">{activeOrder.id}</span>
                      <button
                        onClick={() => copyToClipboard(activeOrder.id, `oid-${activeOrder.id}`)}
                        className="flex-shrink-0 text-foreground/20 hover:text-foreground/60 transition-colors"
                      >
                        {copiedId === `oid-${activeOrder.id}` ? (
                          <span className="text-[9px] text-green-400/70 uppercase tracking-widest">Copied</span>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.4em] text-foreground/25 mb-3">Shipping Address</p>
                    <div className="bg-foreground/3 border border-foreground/6 px-4 py-3">
                      <p className="text-sm text-foreground/60 leading-relaxed whitespace-pre-line">{activeOrder.shipping_address}</p>
                    </div>
                  </div>

                  {/* Items */}
                  {activeOrder.order_items && activeOrder.order_items.length > 0 && (
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.4em] text-foreground/25 mb-3">Items ({activeOrder.order_items.length})</p>
                      <div className="border border-foreground/6 divide-y divide-foreground/5">
                        {activeOrder.order_items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between px-4 py-3">
                            <div>
                              <p className="text-sm text-foreground/70">{item.name}</p>
                              <p className="text-xs text-foreground/30 mt-0.5">{item.size} · ×{item.quantity}</p>
                            </div>
                            <p className="text-sm text-foreground/50">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        ))}
                        <div className="flex items-center justify-between px-4 py-3 bg-foreground/3">
                          <p className="text-xs uppercase tracking-[0.35em] text-foreground/40">Total</p>
                          <p className="text-sm font-semibold text-foreground/80">${activeOrder.total_price.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cancellation reason */}
                  {(activeOrder as any).status === "cancelled" && (activeOrder as any).cancellation_reason && (
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.4em] text-foreground/25 mb-3">Cancellation Reason</p>
                      <p className="text-xs text-red-400/50 italic leading-relaxed">{(activeOrder as any).cancellation_reason}</p>
                    </div>
                  )}

                  {/* Tracking */}
                  {activeOrder.status === "shipped" && activeOrder.tracking_code && (
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.4em] text-foreground/25 mb-2">Tracking</p>
                      <p className="text-xs text-foreground/40 uppercase tracking-widest">{activeOrder.logistics_provider}</p>
                      <p className="text-xs text-foreground/50 font-mono mt-1">{activeOrder.tracking_code}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 pt-2 border-t border-foreground/8">
                    {(activeOrder.status === "pending" || activeOrder.status === "processing") && (
                      <button
                        onClick={() => {
                          setFounderCancelOrderId(activeOrder.id);
                          setFounderCancelReason("");
                          setFounderCancelError(null);
                        }}
                        className="text-[9px] uppercase tracking-[0.3em] text-red-400/50 hover:text-red-400 border border-red-400/15 hover:border-red-400/40 px-3 py-2 transition-colors"
                      >
                        Cancel Order
                      </button>
                    )}
                    <button
                      onClick={() => setActiveOrder(null)}
                      className="ml-auto text-[9px] uppercase tracking-[0.3em] text-foreground/25 hover:text-foreground/60 px-3 py-2 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Founder Cancel Order Modal */}
      <AnimatePresence>
        {founderCancelOrderId && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setFounderCancelOrderId(null); setFounderCancelReason(""); setFounderCancelError(null); }}
              className="fixed inset-0 bg-black/80 z-[60] backdrop-blur-sm" />
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md bg-card border border-foreground/10"
              >
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-widest">Cancel Order</h3>
                    <button onClick={() => { setFounderCancelOrderId(null); setFounderCancelReason(""); setFounderCancelError(null); }} className="text-foreground/30 hover:text-foreground">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-xs text-foreground/40 mb-5 leading-relaxed">Enter a reason for the cancellation. The order will be marked as cancelled.</p>
                  <textarea
                    value={founderCancelReason}
                    onChange={(e) => setFounderCancelReason(e.target.value)}
                    placeholder="Reason for cancellation..."
                    rows={4}
                    autoFocus
                    className="w-full bg-foreground/5 border border-foreground/10 text-foreground placeholder-foreground/20 px-4 py-3 text-sm outline-none focus:border-foreground/30 transition-colors resize-none mb-4"
                  />
                  {founderCancelError && <p className="text-red-400/80 text-xs mb-3">{founderCancelError}</p>}
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setFounderCancelOrderId(null); setFounderCancelReason(""); setFounderCancelError(null); }}
                      className="flex-1 border border-foreground/15 text-foreground/40 hover:text-foreground hover:border-foreground/40 py-3 text-xs uppercase tracking-[0.4em] transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={founderCancelOrder}
                      disabled={founderCancelling || !founderCancelReason.trim()}
                      className="flex-1 bg-red-500/80 text-foreground py-3 text-xs uppercase tracking-[0.4em] font-semibold hover:bg-red-500 transition-colors disabled:opacity-40"
                    >
                      {founderCancelling ? "Cancelling..." : "Cancel Order"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Old Order Detail Modal */}
      <AnimatePresence>
        {activeOldOrder && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setActiveOldOrder(null)}
              className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm" />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-lg bg-card border border-foreground/10 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-foreground/8">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.5em] text-foreground/25 mb-1">Order Details</p>
                    <p className="text-[10px] text-foreground/20 font-mono">{activeOldOrder.id.split("-")[0].toUpperCase()}</p>
                  </div>
                  <button onClick={() => setActiveOldOrder(null)} className="text-foreground/30 hover:text-foreground transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="px-8 py-6 space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.4em] text-foreground/25 mb-2">Placed on</p>
                      <p className="text-sm text-foreground/70">{new Date(activeOldOrder.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                      <p className="text-xs text-foreground/30 mt-0.5">{new Date(activeOldOrder.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] uppercase tracking-[0.4em] text-foreground/25 mb-2">Status</p>
                      <span className="text-xs uppercase tracking-widest font-semibold text-foreground/40">Old Order</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.4em] text-foreground/25 mb-3">Shipping Address</p>
                    <div className="bg-foreground/3 border border-foreground/6 px-4 py-3">
                      <p className="text-sm text-foreground/60 leading-relaxed whitespace-pre-line">{activeOldOrder.shipping_address}</p>
                    </div>
                  </div>
                  {activeOldOrder.order_items && activeOldOrder.order_items.length > 0 && (
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.4em] text-foreground/25 mb-3">Items ({activeOldOrder.order_items.length})</p>
                      <div className="border border-foreground/6 divide-y divide-foreground/5">
                        {activeOldOrder.order_items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between px-4 py-3">
                            <div>
                              <p className="text-sm text-foreground/70">{item.name}</p>
                              <p className="text-xs text-foreground/30 mt-0.5">{item.size} · ×{item.quantity}</p>
                            </div>
                            <p className="text-sm text-foreground/50">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        ))}
                        <div className="flex items-center justify-between px-4 py-3 bg-foreground/3">
                          <p className="text-xs uppercase tracking-[0.35em] text-foreground/40">Total</p>
                          <p className="text-sm font-semibold text-foreground/80">${activeOldOrder.total_price.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="pt-2 border-t border-foreground/8 flex justify-end">
                    <button onClick={() => setActiveOldOrder(null)} className="text-[9px] uppercase tracking-[0.3em] text-foreground/25 hover:text-foreground/60 px-3 py-2 transition-colors">Close</button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Shipping Modal */}
      <AnimatePresence>
        {shippingOrder && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !shippingLoading && setShippingOrder(null)}
              className="fixed inset-0 bg-black/85 z-50 backdrop-blur-sm" />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md bg-card border border-foreground/10"
              >
                <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-foreground/8">
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4 text-purple-400/70" />
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.5em] text-foreground/25 mb-0.5">Shipping</p>
                      <p className="text-sm font-semibold text-foreground uppercase tracking-widest">Mark as Shipped</p>
                    </div>
                  </div>
                  <button onClick={() => !shippingLoading && setShippingOrder(null)} className="text-foreground/30 hover:text-foreground transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="px-8 py-6 space-y-5">
                  <p className="text-xs text-foreground/40 leading-relaxed">
                    Gib den Tracking-Code und den Versanddienstleister ein. Der Kunde erhält automatisch eine E-Mail mit dem Tracking-Link.
                  </p>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.4em] text-foreground/40 mb-2">Versanddienstleister</label>
                    <select
                      value={logisticsProvider}
                      onChange={(e) => setLogisticsProvider(e.target.value)}
                      className="w-full bg-foreground/5 border border-foreground/10 text-foreground text-sm px-4 py-3 outline-none focus:border-foreground/30 transition-colors cursor-pointer"
                    >
                      {CARRIERS.map((c) => (
                        <option key={c} value={c} className="bg-background">{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.4em] text-foreground/40 mb-2">Tracking-Code</label>
                    <input
                      type="text"
                      value={trackingCode}
                      onChange={(e) => setTrackingCode(e.target.value)}
                      placeholder="z.B. 1Z999AA10123456784"
                      className="w-full bg-foreground/5 border border-foreground/10 text-foreground placeholder-foreground/20 px-4 py-3 text-sm outline-none focus:border-foreground/30 transition-colors font-mono"
                      autoFocus
                    />
                  </div>
                  {shippingError && <p className="text-red-400/80 text-xs tracking-wide">{shippingError}</p>}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => !shippingLoading && setShippingOrder(null)}
                      className="flex-1 border border-foreground/10 text-foreground/40 hover:text-foreground/70 py-3 text-xs uppercase tracking-[0.35em] transition-colors"
                    >
                      Abbrechen
                    </button>
                    <button
                      onClick={confirmShipping}
                      disabled={shippingLoading || !trackingCode.trim()}
                      className="flex-1 bg-purple-500/80 hover:bg-purple-500 text-white py-3 text-xs uppercase tracking-[0.35em] font-semibold transition-colors disabled:opacity-40"
                    >
                      {shippingLoading ? "Wird gesendet..." : "Shipped + Email senden"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Confirm Remove Worker Modal */}
      <AnimatePresence>
        {confirmRemoveWorker && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !removingWorker && setConfirmRemoveWorker(null)}
              className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-sm bg-card border border-foreground/10 p-8 z-50"
            >
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-widest mb-2">Remove Worker</h3>
                <p className="text-xs text-foreground/40 leading-relaxed">
                  Are you sure you want to remove{" "}
                  <span className="text-foreground/70">{confirmRemoveWorker.name}</span>?
                  They will lose access immediately.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmRemoveWorker(null)}
                  disabled={removingWorker}
                  className="flex-1 py-3 border border-foreground/15 text-xs uppercase tracking-[0.35em] text-foreground/50 hover:text-foreground hover:border-foreground/40 transition-colors disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAndRemoveWorker}
                  disabled={removingWorker}
                  className="flex-1 py-3 bg-red-500/80 hover:bg-red-500 text-foreground text-xs uppercase tracking-[0.35em] font-semibold transition-colors disabled:opacity-40"
                >
                  {removingWorker ? "Removing..." : "Remove"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add Worker Modal */}
      <AnimatePresence>
        {showAddWorker && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAddWorker(false)} className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md bg-card border border-foreground/10 p-8 z-50"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-widest">Add Worker</h3>
                <button onClick={() => setShowAddWorker(false)} className="text-foreground/30 hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.4em] text-foreground/40 mb-2">Name</label>
                  <input
                    type="text"
                    value={newWorkerName}
                    onChange={(e) => setNewWorkerName(e.target.value)}
                    placeholder="Worker name"
                    className="w-full bg-foreground/5 border border-foreground/10 text-foreground placeholder-foreground/20 px-4 py-3 text-sm outline-none focus:border-foreground/30 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.4em] text-foreground/40 mb-2">Email</label>
                  <input
                    type="email"
                    value={newWorkerEmail}
                    onChange={(e) => setNewWorkerEmail(e.target.value)}
                    placeholder="worker@email.com"
                    className="w-full bg-foreground/5 border border-foreground/10 text-foreground placeholder-foreground/20 px-4 py-3 text-sm outline-none focus:border-foreground/30 transition-colors"
                  />
                </div>
                {addError && <p className="text-red-400/80 text-xs">{addError}</p>}
                <p className="text-[10px] text-foreground/25 leading-relaxed">
                  The worker must sign up through the app using this email to gain access.
                </p>
                <button
                  onClick={addWorker}
                  disabled={addingWorker || !newWorkerName.trim() || !newWorkerEmail.trim()}
                  className="w-full bg-foreground text-background py-3.5 text-xs uppercase tracking-[0.4em] font-semibold hover:bg-foreground/90 transition-colors disabled:opacity-40"
                >
                  {addingWorker ? "Adding..." : "Add Worker"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Ticket Modal */}
      <AnimatePresence>
        {activeTicket && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setActiveTicket(null)} className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: "tween", duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-x-4 top-16 bottom-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl bg-card border border-foreground/10 z-50 flex flex-col"
            >
              <div className="flex items-start justify-between p-6 border-b border-foreground/8">
                <div>
                  <p className="text-xs text-foreground/40 uppercase tracking-widest mb-1">Ticket</p>
                  <h3 className="text-base font-semibold text-foreground">{activeTicket.subject}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`text-[10px] uppercase tracking-widest ${TICKET_STATUS_COLORS[activeTicket.status]}`}>{activeTicket.status}</span>
                    <select value={activeTicket.status} onChange={(e) => updateTicketStatus(e.target.value)}
                      className="bg-foreground/5 border border-foreground/10 text-foreground/50 text-[10px] px-2 py-1 outline-none">
                      {["open", "answered", "closed"].map((s) => <option key={s} value={s} className="bg-background">{s}</option>)}
                    </select>
                  </div>
                </div>
                <button onClick={() => setActiveTicket(null)} className="text-foreground/30 hover:text-foreground transition-colors mt-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="bg-foreground/5 rounded p-4">
                  <p className="text-[10px] uppercase tracking-widest text-foreground/30 mb-2">Original message</p>
                  <p className="text-sm text-foreground/80 leading-relaxed">{activeTicket.message}</p>
                </div>
                {ticketMessages.map((msg) => (
                  <div key={msg.id} className={`p-4 ${msg.sender_role === "worker" ? "bg-foreground/8 ml-4" : "bg-foreground/5 mr-4"}`}>
                    <p className={`text-[10px] uppercase tracking-widest mb-2 ${msg.sender_role === "worker" ? "text-blue-400/60" : "text-foreground/30"}`}>
                      {msg.sender_role === "worker" ? "Staff" : "User"}
                    </p>
                    <p className="text-sm text-foreground/80 leading-relaxed">{msg.message}</p>
                    <p className="text-[10px] text-foreground/20 mt-2">{new Date(msg.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-foreground/8">
                <textarea value={reply} onChange={(e) => setReply(e.target.value)}
                  placeholder="Write a reply..." rows={3}
                  className="w-full bg-foreground/5 border border-foreground/10 text-foreground placeholder-foreground/20 px-4 py-3 text-sm outline-none focus:border-foreground/30 transition-colors resize-none mb-3"
                />
                <button onClick={sendReply} disabled={replying || !reply.trim()}
                  className="w-full bg-foreground text-background py-3 text-xs uppercase tracking-[0.35em] font-semibold hover:bg-foreground/90 transition-colors disabled:opacity-40">
                  {replying ? "Sending..." : "Send Reply"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
