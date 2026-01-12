"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner, Center } from "@chakra-ui/react";

export default function SignupPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/role-selection");
  }, [router]);

  return (
    <Center h="100vh">
      <Spinner size="xl" />
    </Center>
  );
}
