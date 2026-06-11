import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, TokenPayload } from "../utils/jwt";
import { prisma } from "../config/prisma";

/**
 * Extend Express Request to include the `user` property
 */
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Middleware: Authenticate — verifies the Bearer token in the Authorization header
 * Attaches `req.user` with { userId, email, role }
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. Malformed token.",
    });
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

/**
 * Middleware: Authorize — restricts access to specific roles
 * Usage: authorize("ADMIN", "DOCTOR")
 */
export const authorize = (...allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden. You do not have permission to access this resource.",
      });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { isActive: true },
      });

      if (!user || !user.isActive) {
        return res.status(403).json({
          success: false,
          message: "Forbidden. Your account has been deactivated or blocked.",
        });
      }

      next();
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Internal server error during authorization.",
      });
    }
  };
};
