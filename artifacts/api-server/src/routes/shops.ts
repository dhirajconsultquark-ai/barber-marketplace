import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { shopsTable, servicesTable } from "@workspace/db/schema";
import { eq, and, like, or, sql } from "drizzle-orm";

const router: IRouter = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!(req.session as any)?.user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
}

function requireRole(...roles: string[]) {
  return (req: any, res: any, next: any) => {
    const user = (req.session as any)?.user;
    if (!user || !roles.includes(user.role)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  };
}

router.get("/shops", async (req, res) => {
  try {
    const { search, city, page = 1, limit = 12 } = req.query as any;
    const offset = (Number(page) - 1) * Number(limit);

    let conditions: any[] = [eq(shopsTable.status, "approved")];
    if (search) {
      conditions.push(like(shopsTable.name, `%${search}%`));
    }
    if (city) {
      conditions.push(like(shopsTable.city, `%${city}%`));
    }

    const shops = await db.select().from(shopsTable)
      .where(and(...conditions))
      .limit(Number(limit))
      .offset(offset);

    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(shopsTable).where(and(...conditions));

    res.json({ shops, total: Number(count), page: Number(page), limit: Number(limit) });
  } catch (err) {
    req.log.error(err, "List shops error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/shops/my", requireAuth, requireRole("barber"), async (req, res) => {
  try {
    const user = (req.session as any).user;
    const [shop] = await db.select().from(shopsTable).where(eq(shopsTable.ownerId, user.id)).limit(1);
    if (!shop) {
      res.status(404).json({ error: "No shop found" });
      return;
    }
    const services = await db.select().from(servicesTable).where(eq(servicesTable.shopId, shop.id));
    res.json({ ...shop, services, ownerName: user.name });
  } catch (err) {
    req.log.error(err, "Get my shop error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/shops/:shopId", async (req, res) => {
  try {
    const { shopId } = req.params;
    const [shop] = await db.select().from(shopsTable).where(eq(shopsTable.id, Number(shopId))).limit(1);
    if (!shop) {
      res.status(404).json({ error: "Shop not found" });
      return;
    }
    const services = await db.select().from(servicesTable).where(eq(servicesTable.shopId, shop.id));
    res.json({ ...shop, services, ownerName: "Barber" });
  } catch (err) {
    req.log.error(err, "Get shop error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/shops", requireAuth, requireRole("barber"), async (req, res) => {
  try {
    const user = (req.session as any).user;
    const existing = await db.select().from(shopsTable).where(eq(shopsTable.ownerId, user.id)).limit(1);
    if (existing.length > 0) {
      res.status(400).json({ error: "You already have a shop" });
      return;
    }
    const { name, description, address, city, phone, imageUrl } = req.body;
    if (!name || !description || !address || !city || !phone) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }
    const [shop] = await db.insert(shopsTable).values({
      ownerId: user.id, name, description, address, city, phone, imageUrl: imageUrl || null, status: "pending"
    }).returning();
    res.status(201).json(shop);
  } catch (err) {
    req.log.error(err, "Create shop error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/shops/:shopId", requireAuth, requireRole("barber"), async (req, res) => {
  try {
    const user = (req.session as any).user;
    const { shopId } = req.params;
    const [shop] = await db.select().from(shopsTable).where(eq(shopsTable.id, Number(shopId))).limit(1);
    if (!shop) {
      res.status(404).json({ error: "Shop not found" });
      return;
    }
    if (shop.ownerId !== user.id) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const { name, description, address, city, phone, imageUrl } = req.body;
    const [updated] = await db.update(shopsTable)
      .set({ name, description, address, city, phone, imageUrl: imageUrl || null })
      .where(eq(shopsTable.id, Number(shopId)))
      .returning();
    res.json(updated);
  } catch (err) {
    req.log.error(err, "Update shop error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
