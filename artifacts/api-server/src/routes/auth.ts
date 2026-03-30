import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/auth/me", (req, res) => {
  const user = (req.session as any)?.user;
  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.json(user);
});

router.post("/auth/register", async (req, res) => {
  const { email, password, name, role } = req.body;
  if (!email || !password || !name || !role) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }
  if (!["customer", "barber"].includes(role)) {
    res.status(400).json({ error: "Invalid role" });
    return;
  }
  try {
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      res.status(400).json({ error: "Email already registered" });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await db.insert(usersTable).values({ email, passwordHash, name, role }).returning();
    const safeUser = { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt };
    (req.session as any).user = safeUser;
    res.status(201).json(safeUser);
  } catch (err) {
    req.log.error(err, "Register error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const safeUser = { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt };
    (req.session as any).user = safeUser;
    res.json(safeUser);
  } catch (err) {
    req.log.error(err, "Login error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: "Could not logout" });
      return;
    }
    res.json({ message: "Logged out" });
  });
});

export default router;
