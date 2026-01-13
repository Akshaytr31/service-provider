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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  useToast,
  HStack,
  Tag,
  SimpleGrid,
} from "@chakra-ui/react";
import { useParams, useRouter } from "next/navigation";

export default function ProviderRequestDetails() {
  const { id } = useParams();
  const router = useRouter();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const InfoCard = ({ title, children }) => (
    <Box
      bg="gray.800"
      color="gray.100"
      p={5}
      borderRadius="xl"
      border="1px solid"
      borderColor="gray.700"
    >
      <Heading size="sm" mb={4} color="blue.300">
        {title}
      </Heading>
      <Stack spacing={2}>{children}</Stack>
    </Box>
  );

  /* ================= FETCH ================= */

  const fetchRequest = async () => {
    try {
      const res = await fetch(`/api/admin/provider-requests/${id}`);
      const json = await res.json();
      console.log("data", json);
      setData(json);
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

  const handleAction = async (action, reason = "") => {
    try {
      const body = { action };
      if (action === "reject") {
        body.reason = reason;
      }

      const res = await fetch(`/api/admin/provider-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Action failed");
      }

      toast({ title: "Updated successfully", status: "success" });
      router.push("/adminDashboard");
    } catch (err) {
      toast({ title: "Error", description: err.message, status: "error" });
    }
  };

  const confirmReject = () => {
    handleAction("reject", rejectionReason);
    onClose();
  };

  if (loading) {
    return (
      <Box p={6}>
        <Spinner />
      </Box>
    );
  }

  const providerRequest = data;
  const status = providerRequest.status;
  const userType = providerRequest.businessName ? "business" : "individual";

  console.log(userType);

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
      <Box
        display="grid"
        gridTemplateColumns="repeat(auto-fit, minmax(400px, 1fr))"
        gap={4}
      >
        <InfoCard title="User Information">
          <HStack justify="space-between">
            <Text fontWeight="bold">
              {userType === "business" ? "Business" : "Individual"}
            </Text>
            <Tag colorScheme={userType === "business" ? "purple" : "green"}>
              {userType.toUpperCase()}
            </Tag>
          </HStack>

          <Divider />

          <Text>
            <b>Name:</b>{" "}
            {userType === "business"
              ? providerRequest.businessName || "-"
              : providerRequest.user?.name || "-"}
          </Text>

          <Text>
            <b>Email:</b> {providerRequest.user?.email || "-"}
          </Text>
        </InfoCard>

        {/* BUSINESS DETAILS (ONLY FOR BUSINESS) */}
        {userType === "business" && (
          <InfoCard title="Business Details">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
              <Text>
                <b>Name:</b> {providerRequest.businessName || "-"}
              </Text>
              <Text>
                <b>Type:</b> {providerRequest.businessType || "-"}
              </Text>
              <Text>
                <b>Registration:</b> {providerRequest.registrationNumber || "-"}
              </Text>
              <Text>
                <b>Established:</b> {providerRequest.establishmentYear || "-"}
              </Text>
              <Text>
                <b>TRN:</b> {providerRequest.trnNumber || "-"}
              </Text>
              <Text>
                <b>Expiry:</b> {providerRequest.businessExpiryDate || "-"}
              </Text>
            </SimpleGrid>
          </InfoCard>
        )}

        {/* INDIVIDUAL DETAILS (ONLY FOR INDIVIDUAL) */}
        {userType === "individual" && (
          <Box bg="gray.700" color="gray.50" p={5}>
            <Section title="Individual Details">
              <Text>This provider registered as an individual.</Text>
            </Section>
          </Box>
        )}

        {/* LOCATION */}
        <InfoCard title="Location">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
            <Text>
              <b>City:</b> {providerRequest.city || "-"}
            </Text>
            <Text>
              <b>State:</b> {providerRequest.state || "-"}
            </Text>
            <Text>
              <b>Country:</b> {providerRequest.country || "-"}
            </Text>
            <Text>
              <b>Radius:</b>{" "}
              {providerRequest.serviceRadius
                ? `${providerRequest.serviceRadius} km`
                : "-"}
            </Text>
          </SimpleGrid>

          <Divider />

          <Text>
            <b>Service Areas:</b>{" "}
            {(providerRequest.serviceAreas || []).join(", ") || "-"}
          </Text>

          <Text>
            <b>Address:</b> {providerRequest.address || "-"}
          </Text>
        </InfoCard>

        {/* SERVICES */}
        <InfoCard title="Services">
          <Text>
            <b>Description:</b> {providerRequest.description || "-"}
          </Text>
          <Text>
            <b>Experience:</b> {providerRequest.yearsExperience || "-"}
          </Text>

          <HStack wrap="wrap">
            {(providerRequest.servicesOffered || []).length > 0 ? (
              providerRequest.servicesOffered.map((s, i) => (
                <Tag key={i} colorScheme="blue">
                  {s}
                </Tag>
              ))
            ) : (
              <Text>-</Text>
            )}
          </HStack>
        </InfoCard>

        {/* EDUCATION – ONLY FOR INDIVIDUAL */}
        {userType === "individual" && (
          <InfoCard title="Qualifications">
            {(providerRequest.qualifications || []).length > 0 ? (
              providerRequest.qualifications.map((q, i) => (
                <Box key={i} p={3} bg="gray.700" borderRadius="md">
                  <Text fontWeight="bold">{q.degree}</Text>
                  <Text fontSize="sm">
                    {q.institution} • {q.year}
                  </Text>
                </Box>
              ))
            ) : (
              <Text>-</Text>
            )}
          </InfoCard>
        )}

        {/* LICENSES */}
        <InfoCard title="Licenses">
          {(providerRequest.licenses || []).length > 0 ? (
            providerRequest.licenses.map((l, i) => (
              <Box key={i} p={3} bg="gray.700" borderRadius="md">
                <Text fontWeight="bold">{l.name}</Text>
                <Text fontSize="sm">
                  {l.authority} • {l.number}
                </Text>
              </Box>
            ))
          ) : (
            <Text>-</Text>
          )}
        </InfoCard>

        {/* AVAILABILITY */}
        <InfoCard title="Availability">
          <Text>
            <b>Days:</b>{" "}
            {(providerRequest.availability?.days || []).join(", ") || "-"}
          </Text>
          <Text>
            <b>Hours:</b> {providerRequest.availability?.hours?.start || "-"} –{" "}
            {providerRequest.availability?.hours?.end || "-"}
          </Text>
          <Tag
            maxWidth={"120px"}
            colorScheme={
              providerRequest.availability?.emergency ? "red" : "gray"
            }
          >
            Emergency: {providerRequest.availability?.emergency ? "Yes" : "No"}
          </Tag>
        </InfoCard>

        {/* PRICING */}
        <InfoCard title="Pricing">
          <Text>
            <b>Type:</b> {providerRequest.pricingType || "-"}
          </Text>
          <Text>
            <b>Base Rate:</b> {providerRequest.baseRate || "-"}
          </Text>

          <HStack wrap="wrap">
            {(providerRequest.paymentMethods || []).map((p, i) => (
              <Tag key={i} colorScheme="green">
                {p}
              </Tag>
            ))}
          </HStack>
        </InfoCard>

        {/* IDENTITY */}
        {userType === "individual" && (
          <InfoCard title="Identity Verification">
            <Text>
              <b>ID Type:</b> {providerRequest.idType || "-"}
            </Text>
            <Text>
              <b>ID Number:</b> {providerRequest.idNumber || "-"}
            </Text>
            <Tag
              colorScheme={providerRequest.backgroundCheck ? "green" : "red"}
            >
              Background Check: {providerRequest.backgroundCheck ? "Yes" : "No"}
            </Tag>
          </InfoCard>
        )}
      </Box>

      {/* ACTIONS */}
      {status === "PENDING" && (
        <Stack direction="row" spacing={4} mt={6}>
          <Button colorScheme="green" onClick={() => handleAction("approve")}>
            Approve
          </Button>
          <Button colorScheme="red" onClick={onOpen}>
            Reject
          </Button>
        </Stack>
      )}

      {/* REJECTION MODAL */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Reject Request</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={2}>Please provide a reason for rejection:</Text>
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Reason for rejection..."
            />
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={confirmReject}>
              Reject & Send Email
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
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
