"use client";

import { Box, Heading, Text, Button } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import PostService from "../components/PostServices";

export default function ProviderDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") return null;

  const user = session?.user;
  if (!user) return null;

  /* ================= STATUS: NONE ================= */
  if (user.providerRequestStatus === "none") {
    return (
      <Box p={20}>
        <Heading mb={2}>Pending Provider Registration</Heading>
        {/* <Text mb={4}>
          You need to complete onboarding before accessing the provider dashboard.
        </Text> */}
        {/* <Button
          colorScheme="blue"
          onClick={() => router.push("/provider-onboarding")}
        >
          Complete Registration
        </Button> */}
      </Box>
    );
  }

  /* ================= STATUS: PENDING ================= */
  if (user.providerRequestStatus === "PENDING") {
    return (
      <Box p={6}>
        <Heading>Approval Pending</Heading>
        <Text mt={2}>
          Your provider request is under admin review.
        </Text>
      </Box>
    );
  }

  /* ================= STATUS: APPROVED ================= */
  return (
    <Box p={6}>
      <Heading mb={4}>Provider Dashboard</Heading>
      <PostService />
    </Box>
  );
}
