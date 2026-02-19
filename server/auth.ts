import bcrypt from "bcryptjs";
import { type User } from "@shared/schema";

export async function hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
}

export async function comparePasswords(supplied: string, hashed: string) {
    return await bcrypt.compare(supplied, hashed);
}

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}
