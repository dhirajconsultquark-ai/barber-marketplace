import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { shopsTable, reviewsTable, usersTable } from "@workspace/db/schema";
import { eq, avg, count } from "drizzle-orm";

const router: IRouter = Router();

function requireAdmin(req: any, res: any, next: any) {
  const user = (req.session as any)?.user;
  if (!user || user.role !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
}

router.get("/admin/shops", requireAdmin, async (req, res) => {
  try {
    const { status } = req.query as any;
    let shops;
    if (status) {
      shops = await db.select().from(shopsTable).where(eq(shopsTable.status, status));
    } else {
      shops = await db.select().from(shopsTable);
    }
    res.json({ shops, total: shops.length, page: 1, limit: shops.length });
  } catch (err) {
    req.log.error(err, "Admin list shops error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/shops/:shopId/approve", requireAdmin, async (req, res) => {
  try {
    const { shopId } = req.params;
    const [shop] = await db.update(shopsTable)
      .set({ status: "approved", rejectionReason: null })
      .where(eq(shopsTable.id, Number(shopId)))
      .returning();
    if (!shop) {
      res.status(404).json({ error: "Shop not found" });
      return;
    }
    res.json(shop);
  } catch (err) {
    req.log.error(err, "Approve shop error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/shops/:shopId/reject", requireAdmin, async (req, res) => {
  try {
    const { shopId } = req.params;
    const { reason } = req.body;
    if (!reason) {
      res.status(400).json({ error: "Reason is required" });
      return;
    }
    const [shop] = await db.update(shopsTable)
      .set({ status: "rejected", rejectionReason: reason })
      .where(eq(shopsTable.id, Number(shopId)))
      .returning();
    if (!shop) {
      res.status(404).json({ error: "Shop not found" });
      return;
    }
    res.json(shop);
  } catch (err) {
    req.log.error(err, "Reject shop error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/admin/reviews/:reviewId/moderate", requireAdmin, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const [review] = await db.select().from(reviewsTable).where(eq(reviewsTable.id, Number(reviewId))).limit(1);
    if (!review) {
      res.status(404).json({ error: "Review not found" });
      return;
    }
    await db.delete(reviewsTable).where(eq(reviewsTable.id, Number(reviewId)));

    const [stats] = await db.select({
      avg: avg(reviewsTable.rating),
      count: count(),
    }).from(reviewsTable).where(eq(reviewsTable.shopId, review.shopId));

    await db.update(shopsTable).set({
      averageRating: stats.avg ? Number(stats.avg) : null,
      reviewCount: Number(stats.count),
    }).where(eq(shopsTable.id, review.shopId));

    res.json({ message: "Review removed" });
  } catch (err) {
    req.log.error(err, "Moderate review error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/users", requireAdmin, async (req, res) => {
  try {
    const users = await db.select({
      id: usersTable.id,
      email: usersTable.email,
      name: usersTable.name,
      role: usersTable.role,
      createdAt: usersTable.createdAt,
    }).from(usersTable);
    res.json(users);
  } catch (err) {
    req.log.error(err, "Admin list users error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
