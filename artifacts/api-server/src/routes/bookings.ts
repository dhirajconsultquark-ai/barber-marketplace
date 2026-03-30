import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { bookingsTable, shopsTable, servicesTable, usersTable } from "@workspace/db/schema";
import { eq, or } from "drizzle-orm";

const router: IRouter = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!(req.session as any)?.user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
}

async function enrichBooking(booking: any) {
  const [shop] = await db.select().from(shopsTable).where(eq(shopsTable.id, booking.shopId)).limit(1);
  const [service] = await db.select().from(servicesTable).where(eq(servicesTable.id, booking.serviceId)).limit(1);
  const [customer] = await db.select().from(usersTable).where(eq(usersTable.id, booking.customerId)).limit(1);
  return {
    ...booking,
    shopName: shop?.name || "Unknown",
    serviceName: service?.name || "Unknown",
    servicePrice: service?.price || 0,
    customerName: customer?.name || "Unknown",
  };
}

router.get("/bookings", requireAuth, async (req, res) => {
  try {
    const user = (req.session as any).user;
    let bookings: any[];
    if (user.role === "customer") {
      bookings = await db.select().from(bookingsTable).where(eq(bookingsTable.customerId, user.id));
    } else if (user.role === "barber") {
      const [shop] = await db.select().from(shopsTable).where(eq(shopsTable.ownerId, user.id)).limit(1);
      if (!shop) {
        res.json([]);
        return;
      }
      bookings = await db.select().from(bookingsTable).where(eq(bookingsTable.shopId, shop.id));
    } else {
      bookings = await db.select().from(bookingsTable);
    }
    const enriched = await Promise.all(bookings.map(enrichBooking));
    res.json(enriched);
  } catch (err) {
    req.log.error(err, "List bookings error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/bookings", requireAuth, async (req, res) => {
  try {
    const user = (req.session as any).user;
    if (user.role !== "customer") {
      res.status(403).json({ error: "Only customers can book" });
      return;
    }
    const { shopId, serviceId, scheduledAt, notes } = req.body;
    if (!shopId || !serviceId || !scheduledAt) {
      res.status(400).json({ error: "shopId, serviceId, and scheduledAt are required" });
      return;
    }
    const [shop] = await db.select().from(shopsTable).where(eq(shopsTable.id, Number(shopId))).limit(1);
    if (!shop || shop.status !== "approved") {
      res.status(400).json({ error: "Shop not available for booking" });
      return;
    }
    const [booking] = await db.insert(bookingsTable).values({
      customerId: user.id,
      shopId: Number(shopId),
      serviceId: Number(serviceId),
      scheduledAt: new Date(scheduledAt),
      notes: notes || null,
      status: "pending",
    }).returning();
    const enriched = await enrichBooking(booking);
    res.status(201).json(enriched);
  } catch (err) {
    req.log.error(err, "Create booking error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/bookings/:bookingId", requireAuth, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, Number(bookingId))).limit(1);
    if (!booking) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }
    const enriched = await enrichBooking(booking);
    res.json(enriched);
  } catch (err) {
    req.log.error(err, "Get booking error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/bookings/:bookingId", requireAuth, async (req, res) => {
  try {
    const user = (req.session as any).user;
    const { bookingId } = req.params;
    const { status } = req.body;
    const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, Number(bookingId))).limit(1);
    if (!booking) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }
    const allowed = ["confirmed", "completed", "cancelled"];
    if (!allowed.includes(status)) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }
    if (user.role === "customer" && booking.customerId !== user.id) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    if (user.role === "barber") {
      const [shop] = await db.select().from(shopsTable).where(eq(shopsTable.ownerId, user.id)).limit(1);
      if (!shop || shop.id !== booking.shopId) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
    }
    const [updated] = await db.update(bookingsTable).set({ status }).where(eq(bookingsTable.id, Number(bookingId))).returning();
    const enriched = await enrichBooking(updated);
    res.json(enriched);
  } catch (err) {
    req.log.error(err, "Update booking status error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/shops/:shopId/bookings", requireAuth, async (req, res) => {
  try {
    const user = (req.session as any).user;
    const { shopId } = req.params;
    const [shop] = await db.select().from(shopsTable).where(eq(shopsTable.id, Number(shopId))).limit(1);
    if (!shop) {
      res.status(404).json({ error: "Shop not found" });
      return;
    }
    if (shop.ownerId !== user.id && user.role !== "admin") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const bookings = await db.select().from(bookingsTable).where(eq(bookingsTable.shopId, Number(shopId)));
    const enriched = await Promise.all(bookings.map(enrichBooking));
    res.json(enriched);
  } catch (err) {
    req.log.error(err, "List shop bookings error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
