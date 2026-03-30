import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { reviewsTable, usersTable, shopsTable } from "@workspace/db/schema";
import { eq, avg, count, sql } from "drizzle-orm";

const router: IRouter = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!(req.session as any)?.user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
}

router.get("/shops/:shopId/reviews", async (req, res) => {
  try {
    const { shopId } = req.params;
    const reviews = await db.select().from(reviewsTable).where(eq(reviewsTable.shopId, Number(shopId)));
    const enriched = await Promise.all(reviews.map(async (r) => {
      const [customer] = await db.select().from(usersTable).where(eq(usersTable.id, r.customerId)).limit(1);
      return { ...r, customerName: customer?.name || "Anonymous" };
    }));
    res.json(enriched);
  } catch (err) {
    req.log.error(err, "List reviews error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/shops/:shopId/reviews", requireAuth, async (req, res) => {
  try {
    const user = (req.session as any).user;
    if (user.role !== "customer") {
      res.status(403).json({ error: "Only customers can leave reviews" });
      return;
    }
    const { shopId } = req.params;
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ error: "Rating must be between 1 and 5" });
      return;
    }
    const existing = await db.select().from(reviewsTable)
      .where(eq(reviewsTable.shopId, Number(shopId)))
      .where(eq(reviewsTable.customerId, user.id))
      .limit(1);
    if (existing.length > 0) {
      res.status(400).json({ error: "You already reviewed this shop" });
      return;
    }
    const [review] = await db.insert(reviewsTable).values({
      shopId: Number(shopId),
      customerId: user.id,
      rating: Number(rating),
      comment: comment || null,
    }).returning();

    const [stats] = await db.select({
      avg: avg(reviewsTable.rating),
      count: count(),
    }).from(reviewsTable).where(eq(reviewsTable.shopId, Number(shopId)));

    await db.update(shopsTable).set({
      averageRating: Number(stats.avg),
      reviewCount: Number(stats.count),
    }).where(eq(shopsTable.id, Number(shopId)));

    res.status(201).json({ ...review, customerName: user.name });
  } catch (err) {
    req.log.error(err, "Create review error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
