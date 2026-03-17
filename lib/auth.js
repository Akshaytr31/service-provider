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
        if (adminKey && adminKey !== "undefined" && adminKey !== "null") {
          const [existing] = await db.query(
            "SELECT id FROM users WHERE email = ?",
            [email],
          );

          if (existing.length === 0) {
            if (adminKey !== process.env.ADMIN_SECRET) {
              throw new Error("Invalid Admin Secret");
            }

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
        }

        const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
          email,
        ]);

        if (rows.length === 0) {
          return null;
        }

        const user = rows[0];

        if (!user.password) return null;

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
    async signIn({ user, account }) {
      if (account.provider === "google") {
        const [rows] = await db.query("SELECT id FROM users WHERE email = ?", [
          user.email,
        ]);

        if (rows.length === 0) {
          const cookieStore = await cookies();
          const loginMode = cookieStore.get("loginMode")?.value;
          const isProviderAtFirst = loginMode === "provider";

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
      if (trigger === "update" && session) {
        token.role = session.user.role;
        token.isProviderAtFirst = session.user.isProviderAtFirst;
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
        token.id = rows[0].id;
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
