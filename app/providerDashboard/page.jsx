"use client";

import { Box, Heading, Text, Button } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import PostService from "../components/PostServices";
import { useState, useEffect } from "react";

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
      <Box p={6} marginTop={"70px"}>
        <Heading>Approval Pending</Heading>
        <Text mt={2}>
          Your provider request is under admin review.
        </Text>
      </Box>
    );
  }

  /* ================= STATUS: REJECTED ================= */
  if (user.providerRequestStatus === "rejected" || user.providerRequestStatus === "REJECTED") {
     return <RejectedView />;
  }

  /* ================= STATUS: APPROVED ================= */
  return (
    <Box p={6} marginTop={"70px"}>
      <Heading mb={4}>Provider Dashboard</Heading>
      <PostService />
    </Box>
  );
}

function RejectedView() {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
     async function fetchReason() {
        try {
           const res = await fetch('/api/provider/current-request'); 
           if(res.ok) {
             const data = await res.json();
             console.log(data)
             setReason(data.rejectionReason);
           }
        } catch(e) {
           console.error(e);
        } finally {
           setLoading(false);
        }
     }
     fetchReason();
  },[]);

  return (
    <Box p={10} textAlign="center" marginTop={"170px"}>
      <Heading color="red.500" mb={4}>Application Rejected</Heading>
      <Text fontSize="lg" mb={6}>
        Your application to become a provider was rejected.
      </Text>
      {loading ? (
         <Text>Loading details...</Text>
      ) : (
         <Box bg="red.50" p={4} borderRadius="md" mb={6} display="inline-block" maxW="600px">
             <Text fontWeight="bold" color="red.800">Reason:</Text>
             <Text color="red.800">{reason || "No specific reason provided."}</Text>
         </Box>
      )}
      <br />
      <Button colorScheme="blue" onClick={() => router.push("/provider-onboarding")}>
        Reapply
      </Button>
    </Box>
  );
}
