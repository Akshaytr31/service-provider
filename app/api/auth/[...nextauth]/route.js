import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

export const authOptions = {
  debug: true,

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      httpOptions: {
        timeout: 40000,
      },
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        let { email, password, adminKey } = credentials;

        if (!email || !password) return null;

        email = email.toLowerCase().trim();

        // --- Handle Admin Registration ---
        // Only attempt registration if adminKey is provided (and not "undefined" string)
        if (adminKey && adminKey !== "undefined" && adminKey !== "null") {
          // Check if user already exists
          const [existing] = await db.query(
            "SELECT id FROM users WHERE email = ?",
            [email],
          );

          if (existing.length === 0) {
            // User does not exist -> Proceed with Registration

            // 1. Validate Secret
            if (adminKey !== process.env.ADMIN_SECRET) {
              throw new Error("Invalid Admin Secret");
            }

            // 2. Create Admin User
            const hashedPassword = await bcrypt.hash(password, 10);

            const [result] = await db.query(
              `INSERT INTO users (email, password, role, providerRequestStatus, isProviderAtFirst, email_verified)
                 VALUES (?, ?, 'admin', 'none', false, true)`,
              [email, hashedPassword],
            );

            return {
              id: result.insertId,
              email: email,
              role: "admin",
              providerRequestStatus: "none",
              isProviderAtFirst: false,
            };
          }
          // If user exists, fall through to normal login check (ignore adminKey)
        }
        // --- End Admin Registration ---

        const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
          email,
        ]);

        if (rows.length === 0) {
          // No user found - return null to indicate failed login
          // User must sign up first
          return null;
        }

        // LOGIN EXISTING USER
        const user = rows[0];

        if (!user.password) return null; // Google-only user

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return {
          email: user.email,
          role: user.role,
          providerRequestStatus: user.providerRequestStatus,
          isProviderAtFirst: user.isProviderAtFirst,
          id: user.id,
        };
      },
    }),
  ],

  pages: {
    signIn: "/login",
  },

  callbacks: {
    // Google auto insert
    async signIn({ user, account }) {
      console.log("user-acc", user, account);

      if (account.provider === "google") {
        const [rows] = await db.query("SELECT id FROM users WHERE email = ?", [
          user.email,
        ]);

        if (rows.length === 0) {
          // New Google User - Create account
          // Split name if possible
          const names = user.name ? user.name.split(" ") : ["", ""];
          // const firstName = names[0];
          // const lastName = names.length > 1 ? names.slice(1).join(" ") : "";

          // Check cookie for login mode
          const cookieStore = await cookies();
          const loginMode = cookieStore.get("loginMode")?.value;
          const isProviderAtFirst = loginMode === "provider";

          // Default to 'none' role, user will select role in next step
          await db.query(
            `INSERT INTO users (name, email, image, role, providerRequestStatus, isProviderAtFirst)
             VALUES (?, ?, ?, 'none', 'none', ?)`,
            [user.name, user.email, user.image, isProviderAtFirst],
          );
        }
      }
      return true;
    },

    async jwt({ token, user, trigger, session }) {
      // Update token if session is updated (useful for role changes)
      if (trigger === "update" && session) {
        token.role = session.user.role;
        token.isProviderAtFirst = session.user.isProviderAtFirst;
        // Fetch fresh data from DB to be sure
        const [rows] = await db.query(
          "SELECT role, providerRequestStatus, isProviderAtFirst FROM users WHERE email = ?",
          [token.email],
        );
        if (rows.length > 0) {
          token.role = rows[0].role;
          token.isProviderAtFirst = rows[0].isProviderAtFirst;
        }
      }

      const email = user?.email || token.email;
      if (!email) return token;

      if (user) {
        token.id = user.id;
      }

      const [rows] = await db.query(
        "SELECT id, role, providerRequestStatus, isProviderAtFirst FROM users WHERE email = ?",
        [email],
      );

      if (rows.length > 0) {
        token.id = rows[0].id; // Ensure ID is in token
        token.role = rows[0].role;
        token.providerRequestStatus = rows[0].providerRequestStatus;
        token.isProviderAtFirst = rows[0].isProviderAtFirst;
      }

      token.email = email;
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.role = token.role;
        session.user.providerRequestStatus = token.providerRequestStatus;
        session.user.isProviderAtFirst = token.isProviderAtFirst;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
