"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner, Center } from "@chakra-ui/react";

export default function PostLoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== "authenticated") return;

    router.refresh();

    const user = session.user;

    /* ================= ADMIN ================= */
    if (user.role === "admin") {
      router.replace("/adminDashboard");
      return;
    }

    /* ================= NO ROLE or NEW USER ================= */
    if (!user.role || user.role === "new_user" || user.role === "none") {
      router.replace("/role-selection");
      return;
    }

    /* ================= PROVIDER ================= */
    if (user.role === "provider") {
      router.replace("/providerDashboard");
      return;
    }

    /* ================= DEFAULT USER ================= */
    router.replace("/");
  }, [status, session, router]);

  return (
    <Center h="100vh">
      <Spinner size="xl" />
    </Center>
  );
}
