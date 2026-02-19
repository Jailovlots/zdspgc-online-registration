import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { storage } from "./storage";
import { comparePasswords } from "./auth";
import { type User } from "@shared/schema";

export function configurePassport() {
    // Configure Local Strategy for username/password authentication
    passport.use(
        new LocalStrategy(
            {
                usernameField: "username",
                passwordField: "password",
            },
            async (username, password, done) => {
                try {
                    const user = await storage.getUserByUsername(username.toLowerCase().trim());

                    if (!user) {
                        return done(null, false, { message: "Invalid credentials" });
                    }

                    const isValid = await comparePasswords(password, user.password);
                    if (!isValid) {
                        return done(null, false, { message: "Invalid credentials" });
                    }

                    return done(null, user);
                } catch (error) {
                    return done(error);
                }
            }
        )
    );

    // Serialize user to session - store only user ID
    passport.serializeUser((user: Express.User, done) => {
        done(null, (user as User).id);
    });

    // Deserialize user from session - retrieve full user object
    passport.deserializeUser(async (id: number, done) => {
        try {
            const user = await storage.getUser(id);
            done(null, user);
        } catch (error) {
            done(error);
        }
    });
}
