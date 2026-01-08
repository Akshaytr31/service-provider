"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Stack,
  Badge,
  Button,
  Divider,
  Spinner,
} from "@chakra-ui/react";
import { useParams, useRouter } from "next/navigation";

export default function ProviderRequestDetails() {
  const { id } = useParams();
  const router = useRouter();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ================= */

  const fetchRequest = async () => {
    try {
      const res = await fetch(`/api/admin/provider-requests/${id}`);
      const json = await res.json();
      setData(json);
      console.log(
        json,
        "fetch dataaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
      );
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [id]);

  /* ================= ACTION ================= */

  const handleAction = async (action) => {
    await fetch(`/api/admin/provider-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });

    router.push("/adminDashboard");
  };

  if (loading) {
    return (
      <Box p={6}>
        <Spinner />
      </Box>
    );
  }

  const providerRequest = data;
  const { user, status } = data;

  /* ================= UI ================= */

  return (
    <Box p={6} maxW="1000px" mx="auto">
      <Heading mb={4}>Provider Request Details</Heading>

      <Badge
        mb={6}
        colorScheme={
          status === "PENDING"
            ? "yellow"
            : status === "APPROVED"
            ? "green"
            : "red"
        }
      >
        {status}
      </Badge>

      {/* USER INFO */}
      <Box bg="gray.700" color="gray.50" p={5}>
        <Section title="User Information">
          <Text>
            <b>Name:</b> {user?.name || "-"}
          </Text>
          <Text>
            <b>Email:</b> {user?.email || "-"}
          </Text>
        </Section>
      </Box>

      {/* BUSINESS */}
      <Box bg="gray.700" color="gray.50" p={5}>
        <Section title="Business Details">
          <Text>
            <b>Business Name:</b> {providerRequest?.businessName || "-"}
          </Text>
          <Text>
            <b>Type:</b> {providerRequest?.businessType || "-"}
          </Text>
          <Text>
            <b>Registration No:</b> {providerRequest?.registrationNumber || "-"}
          </Text>
          <Text>
            <b>Established:</b> {providerRequest?.establishmentYear || "-"}
          </Text>
        </Section>
      </Box>

      {/* LOCATION */}
      <Box bg="gray.700" color="gray.50" p={5}>
        <Section title="Location" titleMt={0}>
          <Text>
            <b>City:</b> {providerRequest?.city}
          </Text>
          <Text>
            <b>State:</b> {providerRequest?.state}
          </Text>
          <Text>
            <b>Country:</b> {providerRequest?.country}
          </Text>
          <Text>
            <b>Service Radius:</b> {providerRequest?.serviceRadius} km
          </Text>
          <Text>
            <b>Service Areas:</b>{" "}
            {(providerRequest?.serviceAreas || []).join(", ") || "-"}
          </Text>
        </Section>
      </Box>

      {/* SERVICES */}
      <Box bg="gray.700" color="gray.50" p={5}>
        <Section title="Services">
          <Text>
            <b>Description:</b> {providerRequest?.description}
          </Text>
          <Text>
            <b>Experience:</b> {providerRequest?.yearsExperience}
          </Text>
          <Text>
            <b>Services Offered:</b>{" "}
            {(providerRequest?.servicesOffered || []).join(", ")}
          </Text>
        </Section>
      </Box>

      {/* EDUCATION */}
      <Box bg="gray.700" color="gray.50" p={5}>
        <Section title="Qualifications">
          {(providerRequest?.qualifications || []).map((q, i) => (
            <Text key={i}>
              {q.degree} — {q.institution} ({q.year})
            </Text>
          ))}
        </Section>
      </Box>

      {/* LICENSES */}
      <Box bg="gray.700" color="gray.50" p={5}>
        <Section title="Licenses">
          {(providerRequest?.licenses || []).map((l, i) => (
            <Text key={i}>
              {l.name} — {l.authority} ({l.number})
            </Text>
          ))}
        </Section>
      </Box>

      {/* AVAILABILITY */}
      <Box bg="gray.700" color="gray.50" p={5}>
        <Section title="Availability">
          <Text>
            <b>Days:</b>{" "}
            {(providerRequest?.availability?.days || []).join(", ")}
          </Text>
          <Text>
            <b>Hours:</b> {providerRequest?.availability?.hours?.start} -{" "}
            {providerRequest?.availability?.hours?.end}
          </Text>
          <Text>
            <b>Emergency:</b>{" "}
            {providerRequest?.availability?.emergency ? "Yes" : "No"}
          </Text>
        </Section>
      </Box>

      {/* PRICING */}
      <Box bg="gray.700" color="gray.50" p={5}>
        <Section title="Pricing">
          <Text>
            <b>Type:</b> {providerRequest?.pricingType}
          </Text>
          <Text>
            <b>Base Rate:</b> {providerRequest?.baseRate}
          </Text>
          <Text>
            <b>Payment:</b> {(providerRequest?.paymentMethods || []).join(", ")}
          </Text>
        </Section>
      </Box>

      {/* IDENTITY */}
      <Box bg="gray.700" color="gray.50" p={5}>
        <Section title="Identity">
          <Text>
            <b>ID Type:</b> {providerRequest?.idType}
          </Text>
          <Text>
            <b>ID Number:</b> {providerRequest?.idNumber}
          </Text>
          <Text>
            <b>Background Check:</b>{" "}
            {providerRequest?.backgroundCheck ? "Yes" : "No"}
          </Text>
        </Section>
      </Box>

      {/* ACTIONS */}
      {status === "PENDING" && (
        <Stack direction="row" spacing={4} mt={6}>
          <Button colorScheme="green" onClick={() => handleAction("approve")}>
            Approve
          </Button>
          <Button colorScheme="red" onClick={() => handleAction("reject")}>
            Reject
          </Button>
        </Stack>
      )}
    </Box>
  );
}

/* ================= HELPER ================= */

function Section({ title, children }) {
  return (
    <>
      <Heading size="sm" mt={6} mb={2}>
        {title}
      </Heading>
      <Stack spacing={1}>{children}</Stack>
      <Divider mt={3} />
    </>
  );
}
