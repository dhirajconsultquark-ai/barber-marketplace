import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { servicesTable, shopsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!(req.session as any)?.user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
}

router.get("/shops/:shopId/services", async (req, res) => {
  try {
    const { shopId } = req.params;
    const services = await db.select().from(servicesTable).where(eq(servicesTable.shopId, Number(shopId)));
    res.json(services);
  } catch (err) {
    req.log.error(err, "List services error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/shops/:shopId/services", requireAuth, async (req, res) => {
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
    const { name, description, price, durationMinutes } = req.body;
    if (!name || price === undefined || !durationMinutes) {
      res.status(400).json({ error: "name, price, and durationMinutes are required" });
      return;
    }
    const [service] = await db.insert(servicesTable).values({
      shopId: Number(shopId), name, description: description || null, price: Number(price), durationMinutes: Number(durationMinutes)
    }).returning();
    res.status(201).json(service);
  } catch (err) {
    req.log.error(err, "Create service error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/shops/:shopId/services/:serviceId", requireAuth, async (req, res) => {
  try {
    const user = (req.session as any).user;
    const { shopId, serviceId } = req.params;
    const [shop] = await db.select().from(shopsTable).where(eq(shopsTable.id, Number(shopId))).limit(1);
    if (!shop || (shop.ownerId !== user.id && user.role !== "admin")) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const { name, description, price, durationMinutes } = req.body;
    const [updated] = await db.update(servicesTable)
      .set({ name, description: description || null, price: Number(price), durationMinutes: Number(durationMinutes) })
      .where(eq(servicesTable.id, Number(serviceId)))
      .returning();
    res.json(updated);
  } catch (err) {
    req.log.error(err, "Update service error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/shops/:shopId/services/:serviceId", requireAuth, async (req, res) => {
  try {
    const user = (req.session as any).user;
    const { shopId, serviceId } = req.params;
    const [shop] = await db.select().from(shopsTable).where(eq(shopsTable.id, Number(shopId))).limit(1);
    if (!shop || (shop.ownerId !== user.id && user.role !== "admin")) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    await db.delete(servicesTable).where(eq(servicesTable.id, Number(serviceId)));
    res.json({ message: "Service deleted" });
  } catch (err) {
    req.log.error(err, "Delete service error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
