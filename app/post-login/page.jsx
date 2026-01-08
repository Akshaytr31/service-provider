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

    const user = session.user;

    if (!user.role) {
      router.replace("/role-selection");
      return;
    }

    if (user.role === "provider") {
      if (
        user.providerRequestStatus === "APPROVED" ||
        user.providerRequestStatus === "PENDING"
      ) {
        router.replace("/providerDashboard");
        return;
      }

      router.replace("/providerDashboard");
      return;
    }

    router.replace("/");
  }, [status, session, router]);

  return (
    <Center h="100vh">
      <Spinner size="xl" />
    </Center>
  );
}
