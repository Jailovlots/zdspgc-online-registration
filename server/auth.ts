import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { type Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { type User } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_keep_it_safe";

export async function hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
}

export async function comparePasswords(supplied: string, hashed: string) {
    return await bcrypt.compare(supplied, hashed);
}

export function generateToken(user: User) {
    return jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: "24h" }
    );
}

export function verifyToken(token: string) {
    try {
        return jwt.verify(token, JWT_SECRET) as { id: number; username: string; role: string };
    } catch (err) {
        return null;
    }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    if (!decoded) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user = await storage.getUser(decoded.id);
    if (!user) {
        return res.status(401).json({ message: "User no longer exists" });
    }

    req.user = user;
    next();
}

export function roleMiddleware(roles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required" });
        }

        if (!roles.includes((req.user as User).role)) {
            return res.status(403).json({ message: "Permission denied" });
        }

        next();
    };
}

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}
