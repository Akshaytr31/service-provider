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
  Icon,
  Container,
  VStack,
  Grid,
} from "@chakra-ui/react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  InfoIcon,
  PhoneIcon,
  EmailIcon,
  CalendarIcon,
  TimeIcon,
  AtSignIcon,
  CheckCircleIcon,
  WarningIcon,
  ExternalLinkIcon,
  ArrowBackIcon,
} from "@chakra-ui/icons";

const MotionBox = motion(Box);
const MotionHStack = motion(HStack);

export default function ProviderRequestDetails() {
  const { id } = useParams();
  const router = useRouter();

  const [data, setData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const getDocumentUrl = (doc) => {
    if (!doc || doc.provider !== "cloudinary") return null;

    // Use stored secure URL if available (most reliable)
    if (doc.secureUrl) return doc.secureUrl;

    const resourceType = doc.resourceType || "image";
    const cloudName =
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dgalhzf0o";

    // For raw files, the extension is already part of the publicId
    if (resourceType === "raw") {
      return `https://res.cloudinary.com/${cloudName}/raw/upload/${doc.version ? `v${doc.version}/` : ""}${doc.publicId}`;
    }

    // For images/videos, we append the format if available
    const extension = doc.format ? `.${doc.format}` : "";
    const versionSegment = doc.version ? `v${doc.version}/` : "";
    return `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/${versionSegment}${doc.publicId}${extension}`;
  };

  /* ================= FETCH ================= */

  const fetchRequest = async () => {
    try {
      const res = await fetch(`/api/admin/provider-requests/${id}`);
      const json = await res.json();
      console.log(json, "json");
      setData(json);
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const json = await res.json();
      setCategories(json.categories || json);
    } catch (err) {
      console.error("Fetch categories failed", err);
    }
  };

  useEffect(() => {
    fetchRequest();
    fetchCategories();
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

      toast({
        title: `Request ${action === "approve" ? "Approved" : "Rejected"}`,
        status: "success",
        duration: 3000,
      });
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
      <Box
        height="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="gray.50"
      >
        <Spinner size="xl" color="green.500" thickness="4px" />
      </Box>
    );
  }

  const providerRequest = data;
  const status = providerRequest.status;
  const userType = providerRequest.businessName ? "business" : "individual";

  /* ================= COMPONENTS ================= */

  const InfoCard = ({ title, icon, children, delay = 0 }) => (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      bg="white"
      p={8}
      borderRadius="2xl"
      border="1px solid"
      borderColor="gray.100"
      boxShadow="sm"
      _hover={{
        transform: "translateY(-4px)",
        borderColor: "green.100",
        boxShadow: "xl",
        transition: "all 0.3s",
      }}
    >
      <HStack mb={6} spacing={3}>
        {icon && <Icon as={icon} color="green.500" w={5} h={5} />}
        <Heading
          size="xs"
          textTransform="uppercase"
          letterSpacing="widest"
          color="gray.500"
        >
          {title}
        </Heading>
      </HStack>
      <VStack align="start" spacing={3} w="full">
        {children}
      </VStack>
    </MotionBox>
  );

  const LabelValue = ({ label, value, isFullWidth = false }) => (
    <Box w={isFullWidth ? "full" : "auto"}>
      <Text
        fontSize="xs"
        fontWeight="bold"
        color="gray.500"
        textTransform="uppercase"
        mb={0.5}
      >
        {label}
      </Text>
      <Text fontSize="sm" color="gray.800" fontWeight="bold">
        {value || "-"}
      </Text>
    </Box>
  );

  /* ================= UI ================= */

  return (
    <Box minH="100vh" bg="gray.50" pb={12} pt="90px">
      {/* Page Header (Sub-header below Global Navbar) */}
      <Box
        position="sticky"
        top="60px"
        zIndex={10}
        bg="whiteAlpha.800"
        backdropFilter="blur(20px)"
        borderBottom="1px solid"
        borderColor="gray.100"
        py={5}
        mb={10}
      >
        <Container maxW="container.xl">
          <HStack justify="space-between" wrap="wrap" gap={4}>
            <HStack spacing={4}>
              <Button
                leftIcon={<ArrowBackIcon />}
                variant="outline"
                borderColor="gray.200"
                color="gray.600"
                _hover={{ bg: "gray.50" }}
                onClick={() => router.back()}
              >
                Back
              </Button>
              <VStack align="start" spacing={0}>
                <Heading size="md" color="gray.800">
                  Provider Request
                </Heading>
                <Text fontSize="xs" color="gray.500" fontWeight="bold">
                  REF ID: {id?.slice(-8).toUpperCase()}
                </Text>
              </VStack>
            </HStack>

            <HStack spacing={4}>
              <Badge
                px={4}
                py={1}
                borderRadius="full"
                fontSize="sm"
                textTransform="capitalize"
                variant="subtle"
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
              {status === "PENDING" && (
                <HStack spacing={3}>
                  <Button
                    size="sm"
                    variant="outline"
                    borderColor="red.500"
                    color="red.500"
                    borderRadius="xl"
                    px={6}
                    _hover={{ bg: "red.50" }}
                    onClick={onOpen}
                  >
                    Reject Application
                  </Button>
                  <Button
                    size="sm"
                    bg="green.500"
                    color="white"
                    borderRadius="xl"
                    px={8}
                    boxShadow="0 10px 15px -3px rgba(72, 187, 120, 0.4)"
                    _hover={{ bg: "green.600", transform: "scale(1.02)" }}
                    transition="all 0.2s"
                    onClick={() => handleAction("approve")}
                  >
                    Approve Request
                  </Button>
                </HStack>
              )}
            </HStack>
          </HStack>
        </Container>
      </Box>

      <Container maxW="container.xl">
        <SimpleGrid columns={{ base: 1, lg: 1 }} spacing={8}>
          {/* Main Column */}
          <VStack spacing={8} align="stretch" gridColumn={{ lg: "span 2" }}>
            {/* User Information */}
            <InfoCard title="User Information" icon={InfoIcon} delay={0.1}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
                <LabelValue label="Type" value={userType.toUpperCase()} />
                <LabelValue
                  label="Name"
                  value={
                    userType === "business"
                      ? providerRequest.businessName
                      : providerRequest.user?.name
                  }
                />
                <LabelValue label="Email" value={providerRequest.user?.email} />
                {/* <LabelValue label="Mobile" value={providerRequest.phone} /> */}
              </SimpleGrid>
            </InfoCard>

            {/* Business Details */}
            {userType === "business" && (
              <InfoCard
                title="Business Details"
                icon={CheckCircleIcon}
                delay={0.2}
              >
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} w="full">
                  <LabelValue
                    label="Business Type"
                    value={providerRequest.businessType}
                  />
                  <LabelValue
                    label="Registration #"
                    value={providerRequest.registrationNumber}
                  />
                  <LabelValue
                    label="Est. Year"
                    value={providerRequest.establishmentYear}
                  />
                  <LabelValue
                    label="TRN Number"
                    value={providerRequest.trnNumber}
                  />
                  <LabelValue
                    label="Expiry Date"
                    value={providerRequest.businessExpiryDate}
                  />
                </SimpleGrid>
              </InfoCard>
            )}

            {/* Location */}
            <InfoCard title="Location" icon={WarningIcon} delay={0.25}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
                <LabelValue label="City" value={providerRequest.city} />
                <LabelValue label="State" value={providerRequest.state} />
                <LabelValue label="Country" value={providerRequest.country} />
                <LabelValue
                  label="Radius"
                  value={`${providerRequest.serviceRadius} KM`}
                />
              </SimpleGrid>
              <Box pt={2}>
                <LabelValue
                  label="Service Areas"
                  value={providerRequest.serviceAreas?.join(", ")}
                  isFullWidth
                />
              </Box>
              <Box pt={2}>
                <LabelValue
                  label="Address"
                  value={providerRequest.address}
                  isFullWidth
                />
              </Box>
            </InfoCard>

            {/* Services */}
            <InfoCard title="Services Offered" icon={AtSignIcon} delay={0.3}>
              <Stack spacing={6} w="full">
                {Array.isArray(providerRequest.servicesOffered) &&
                providerRequest.servicesOffered.length > 0 ? (
                  providerRequest.servicesOffered.map((serviceEntry, i) => {
                    const isObject =
                      typeof serviceEntry === "object" && serviceEntry !== null;

                    if (isObject) {
                      const category = categories.find(
                        (c) => c.id === Number(serviceEntry.categoryId),
                      );
                      const subCategory = category?.subCategories?.find(
                        (sc) => sc.id === Number(serviceEntry.subCategoryId),
                      );

                      return (
                        <Box
                          key={i}
                          p={5}
                          bg="gray.50"
                          borderRadius="2xl"
                          border="1px solid"
                          borderColor="gray.100"
                        >
                          <HStack justify="space-between" mb={4}>
                            <Text
                              fontWeight="bold"
                              color="green.600"
                              fontSize="sm"
                            >
                              Service Entry #{i + 1}
                            </Text>
                            <Badge
                              colorScheme="green"
                              variant="subtle"
                              borderRadius="full"
                              px={3}
                            >
                              {category?.name || "Detailed Service"}
                            </Badge>
                          </HStack>

                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                            <Box>
                              <Text
                                fontSize="2xs"
                                fontWeight="bold"
                                color="gray.400"
                                textTransform="uppercase"
                              >
                                Category
                              </Text>
                              <Text fontSize="sm" fontWeight="bold">
                                {category?.name ||
                                  `ID: ${serviceEntry.categoryId || "-"}`}
                              </Text>
                            </Box>
                            <Box>
                              <Text
                                fontSize="2xs"
                                fontWeight="bold"
                                color="gray.400"
                                textTransform="uppercase"
                              >
                                Sub-Category
                              </Text>
                              <Text fontSize="sm" fontWeight="bold">
                                {subCategory?.name ||
                                  `ID: ${serviceEntry.subCategoryId || "-"}`}
                              </Text>
                            </Box>
                            <Box>
                              <Text
                                fontSize="2xs"
                                fontWeight="bold"
                                color="gray.400"
                                textTransform="uppercase"
                              >
                                Years of Experience
                              </Text>
                              <Text fontSize="sm" fontWeight="bold">
                                {serviceEntry.yearsExperience
                                  ? `${serviceEntry.yearsExperience} Years`
                                  : "-"}
                              </Text>
                            </Box>
                            <Box gridColumn="1 / -1">
                              <Text
                                fontSize="2xs"
                                fontWeight="bold"
                                color="gray.400"
                                textTransform="uppercase"
                                mb={1}
                              >
                                Description
                              </Text>
                              <Text fontSize="sm" color="gray.700">
                                {serviceEntry.description || "-"}
                              </Text>
                            </Box>

                            {/* Nested Extra Skills for this entry */}
                            {Array.isArray(serviceEntry.extraSkills) &&
                              serviceEntry.extraSkills.length > 0 && (
                                <Box gridColumn="1 / -1">
                                  <Text
                                    fontSize="2xs"
                                    fontWeight="bold"
                                    color="gray.400"
                                    textTransform="uppercase"
                                    mb={2}
                                  >
                                    Additional Skills / Services Offered
                                  </Text>
                                  <HStack wrap="wrap" spacing={2}>
                                    {serviceEntry.extraSkills.map(
                                      (skill, si) => (
                                        <Tag
                                          key={si}
                                          size="sm"
                                          variant="outline"
                                          colorScheme="green"
                                          borderRadius="full"
                                        >
                                          {skill}
                                        </Tag>
                                      ),
                                    )}
                                  </HStack>
                                </Box>
                              )}
                          </SimpleGrid>
                        </Box>
                      );
                    } else {
                      return (
                        <Tag
                          key={i}
                          size="md"
                          variant="solid"
                          colorScheme="green"
                          borderRadius="full"
                          mr={2}
                          mb={2}
                        >
                          {serviceEntry}
                        </Tag>
                      );
                    }
                  })
                ) : (
                  <Text color="gray.400" fontSize="sm">
                    No services listed.
                  </Text>
                )}

                <Divider />

                <Box>
                  <LabelValue
                    label="Overall Experience"
                    value={`${providerRequest.yearsExperience || "0"} Years`}
                  />
                </Box>
              </Stack>
            </InfoCard>

            {/* Qualifications & Licenses */}
            <SimpleGrid columns={{ base: 1, md: 1 }} spacing={8}>
              {userType === "individual" && (
                <InfoCard
                  title="Qualifications"
                  icon={CalendarIcon}
                  delay={0.4}
                >
                  <VStack align="stretch" w="full" spacing={4}>
                    {providerRequest.qualifications?.map((q, i) => (
                      <Box
                        display="grid"
                        gridTemplateColumns="repeat(2, 1fr)"
                        key={i}
                        borderRadius="lg"
                        gap="10px"
                      >
                        <Text color="#34d399" fontWeight="bold">
                          {q.degree}
                        </Text>
                        <Text color="gray.400">
                          <b>Institution:</b>
                          {q.institution}
                        </Text>
                        <Text color="gray.400">
                          <b>Year of completion:</b>
                          {q.year}
                        </Text>
                      </Box>
                    ))}
                  </VStack>
                </InfoCard>
              )}

              <InfoCard title="Licenses" icon={WarningIcon} delay={0.4}>
                <VStack align="stretch" w="full" spacing={4}>
                  {providerRequest.licenses?.map((l, i) => {
                    const docUrl = getDocumentUrl(l.document);
                    return (
                      <Box key={i} borderRadius="lg" position="relative">
                        <Grid
                          templateColumns="repeat(2, 1fr)"
                          gap={3}
                          color="gray.600"
                        >
                          <Text color="#34d399" fontWeight="bold">
                            {l.name}
                          </Text>
                          <Box>
                            <b>Authority:</b>
                            {l.authority} <br />
                          </Box>
                          <Box>
                            <b>Number:</b>
                            {l.number} <br />
                          </Box>
                          <Box>
                            <b>Expiry:</b>
                            {l.expiry}
                          </Box>
                        </Grid>
                        {docUrl && (
                          <Button
                            size="xs"
                            mt={2}
                            rightIcon={<ExternalLinkIcon />}
                            colorScheme="green"
                            variant="outline"
                            p={1}
                            onClick={() => window.open(docUrl, "_blank")}
                          >
                            View Document
                          </Button>
                        )}
                      </Box>
                    );
                  })}
                </VStack>
              </InfoCard>
            </SimpleGrid>
          </VStack>

          {/* Sidebar Column */}
          <VStack spacing={8} align="stretch">
            {/* Availability */}
            <InfoCard title="Availability" icon={TimeIcon} delay={0.5}>
              <LabelValue
                label="Days"
                value={providerRequest.availability?.days?.join(", ")}
              />
              <LabelValue
                label="Hours"
                value={`${providerRequest.availability?.hours?.start} - ${providerRequest.availability?.hours?.end}`}
              />
              <Tag
                colorScheme={
                  providerRequest.availability?.emergency ? "red" : "gray"
                }
                variant="solid"
                size="sm"
              >
                Emergency:{" "}
                {providerRequest.availability?.emergency ? "Yes" : "No"}
              </Tag>
            </InfoCard>

            {/* Pricing */}
            <InfoCard title="Pricing" icon={EmailIcon} delay={0.6}>
              <SimpleGrid columns={2} w="full">
                <LabelValue label="Type" value={providerRequest.pricingType} />
                <LabelValue
                  label="Base Rate"
                  value={providerRequest.baseRate}
                />
              </SimpleGrid>
              <Box pt={2}>
                <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={1}>
                  PAYMENT METHODS
                </Text>
                <HStack wrap="wrap" spacing={2}>
                  {providerRequest.paymentMethods?.map((p, i) => (
                    <Tag
                      key={i}
                      size="sm"
                      colorScheme="green"
                      variant="outline"
                    >
                      {p}
                    </Tag>
                  ))}
                </HStack>
              </Box>
            </InfoCard>

            {/* Identity Verification */}
            <InfoCard
              title="Identity Verification"
              icon={CheckCircleIcon}
              delay={0.7}
            >
              <VStack align="stretch" spacing={3} w="full">
                <LabelValue label="ID Type" value={providerRequest.idType} />
                <LabelValue
                  label="ID Number"
                  value={providerRequest.idNumber}
                />
                <Tag
                  colorScheme={
                    providerRequest.backgroundCheck ? "green" : "red"
                  }
                  variant="subtle"
                  alignSelf="start"
                >
                  Background Check:{" "}
                  {providerRequest.backgroundCheck ? "Yes" : "No"}
                </Tag>
              </VStack>
            </InfoCard>
          </VStack>
        </SimpleGrid>
      </Container>

      {/* REJECTION MODAL */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
        <ModalOverlay backdropFilter="blur(5px)" bg="rgba(0,0,0,0.7)" />
        <ModalContent
          bg="white"
          color="gray.800"
          borderRadius="3xl"
          border="1px solid"
          borderColor="gray.100"
          boxShadow="2xl"
        >
          <ModalHeader borderBottom="1px solid" borderColor="gray.50" py={6}>
            Reject Request
          </ModalHeader>
          <ModalCloseButton mt={2} />
          <ModalBody py={8}>
            <Text
              mb={4}
              color="gray.500"
              fontSize="xs"
              fontWeight="bold"
              textTransform="uppercase"
            >
              Reason for rejection
            </Text>
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Incomplete documentation or incorrect details..."
              bg="gray.50"
              borderColor="gray.100"
              _hover={{ borderColor: "green.200" }}
              _focus={{
                borderColor: "green.400",
                boxShadow: "0 0 0 1px green.400",
              }}
              h="150px"
              borderRadius="2xl"
              fontSize="sm"
            />
          </ModalBody>

          <ModalFooter bg="gray.50" borderBottomRadius="3xl" py={6}>
            <Button variant="ghost" mr={3} onClick={onClose} borderRadius="xl">
              Cancel
            </Button>
            <Button
              bg="red.500"
              color="white"
              borderRadius="xl"
              px={8}
              _hover={{ bg: "red.600" }}
              onClick={confirmReject}
              isDisabled={!rejectionReason.trim()}
            >
              Confirm Rejection
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
