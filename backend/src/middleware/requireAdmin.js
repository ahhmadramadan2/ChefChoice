import { requireAuth } from "./auth.js";

export default function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }
    next();
  });
}