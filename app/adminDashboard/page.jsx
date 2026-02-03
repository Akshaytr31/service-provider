"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
  Spinner,
  Badge,
  HStack,
  VStack,
  Card,
  CardBody,
  Flex,
  Text,
  SimpleGrid,
  Icon,
  Avatar,
  Tab,
  TabList,
  Tabs,
  TabPanels,
  TabPanel,
  Container,
  stat,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import {
  FiUsers,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiSettings,
  FiFileText,
  FiChevronRight,
  FiShield,
} from "react-icons/fi";
import { motion } from "framer-motion";
import CategoryManager from "../components/admin/CategoryManager";

const MotionCard = motion(Card);

export default function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL"); // "ALL" | "PENDING" | "APPROVED" | "REJECTED"
  const router = useRouter();

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/admin/provider-requests");
      const data = await res.json();
      setRequests(data);
    } catch (error) {
      console.error("Failed to fetch requests", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const hasExpiredLicense = (req) => {
    // Check if any license in the array is expired
    return (
      Array.isArray(req.licenses) &&
      req.licenses.some((l) => l.status === "EXPIRED")
    );
  };

  // Calculate Stats
  const stats = useMemo(() => {
    const total = requests.length;
    // Pending includes actual PENDING status OR requests with EXPIRED licenses
    const pendingOrExpired = requests.filter(
      (r) => r.status === "PENDING" || hasExpiredLicense(r),
    ).length;

    // Active providers (APPROVED and NO expired licenses)
    // OR we just count APPROVED, but user might want separation.
    // For now, let's keep strict "APPROVED" count, but maybe the user wants "Healthy" vs "Needs Attention".
    const approved = requests.filter((r) => r.status === "APPROVED").length;
    const rejected = requests.filter((r) => r.status === "REJECTED").length;

    return [
      {
        id: "ALL",
        label: "Total Requests",
        value: total,
        icon: FiUsers,
        color: "blue.500",
        bg: "blue.50",
      },
      {
        id: "PENDING",
        label: "Pending / Attention",
        value: pendingOrExpired,
        icon: FiClock,
        color: "orange.500",
        bg: "orange.50",
      },
      {
        id: "APPROVED",
        label: "Active Providers",
        value: approved,
        icon: FiCheckCircle,
        color: "green.500",
        bg: "green.50",
      },
      {
        id: "REJECTED",
        label: "Rejected",
        value: rejected,
        icon: FiXCircle,
        color: "red.500",
        bg: "red.50",
      },
    ];
  }, [requests]);

  const filteredRequests = useMemo(() => {
    if (filterStatus === "ALL") return requests;

    if (filterStatus === "PENDING") {
      return requests.filter(
        (r) => r.status === "PENDING" || hasExpiredLicense(r),
      );
    }

    return requests.filter((r) => r.status === filterStatus);
  }, [requests, filterStatus]);

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

  return (
    <Box minH="100vh" bg="#f8fafc" pt="100px" pb="20">
      <Container maxW="container.xl">
        {/* HEADER */}
        <Flex
          justify="space-between"
          align="center"
          mb={8}
          bg="white"
          p={6}
          borderRadius="2xl"
          boxShadow="sm"
          border="1px solid"
          borderColor="gray.100"
        >
          <VStack align="start" spacing={1}>
            <Heading size="lg" color="gray.800" fontWeight="800">
              Admin Dashboard
            </Heading>
            <Text color="gray.500" fontSize="sm">
              Manage your platform overview and settings
            </Text>
          </VStack>
          <Button
            leftIcon={<FiShield />}
            colorScheme="green"
            variant="outline"
            borderRadius="xl"
            onClick={() => router.push("/admin/privacy-policy")}
          >
            Privacy Policy
          </Button>
        </Flex>

        {/* STATS TILES */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={10}>
          {stats.map((stat, index) => {
            const isActive = filterStatus === stat.id;
            return (
              <MotionCard
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                bg={isActive ? `${stat.color.split(".")[0]}.50` : "white"}
                borderColor={isActive ? stat.color : "gray.100"}
                borderWidth={isActive ? "2px" : "1px"}
                borderRadius="2xl"
                boxShadow={isActive ? "md" : "sm"}
                cursor="pointer"
                onClick={() => setFilterStatus(stat.id)}
                whileHover={{ y: -4, boxShadow: "lg" }}
              >
                <CardBody>
                  <Flex justify="space-between" align="center">
                    <Box>
                      <Text
                        fontSize="sm"
                        fontWeight="bold"
                        color="gray.500"
                        textTransform="uppercase"
                        mb={1}
                      >
                        {stat.label}
                      </Text>
                      <Heading size="xl" color="gray.800">
                        {stat.value}
                      </Heading>
                    </Box>
                    <Flex
                      p={4}
                      bg={isActive ? "white" : stat.bg}
                      color={stat.color}
                      borderRadius="2xl"
                      align="center"
                      justify="center"
                    >
                      <Icon as={stat.icon} w={6} h={6} />
                    </Flex>
                  </Flex>
                </CardBody>
              </MotionCard>
            );
          })}
        </SimpleGrid>

        {/* MAIN CONTENT TABS */}
        <Tabs variant="soft-rounded" colorScheme="green" isLazy>
          <TabList
            mb={6}
            bg="white"
            p={2}
            borderRadius="xl"
            width="fit-content"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.100"
          >
            <Tab
              fontWeight="bold"
              fontSize="sm"
              borderRadius="lg"
              _selected={{ bg: "green.500", color: "white" }}
            >
              <HStack spacing={2}>
                <FiFileText />
                <Text>Provider Requests</Text>
              </HStack>
            </Tab>
            <Tab
              fontWeight="bold"
              fontSize="sm"
              borderRadius="lg"
              _selected={{ bg: "green.500", color: "white" }}
            >
              <HStack spacing={2}>
                <FiSettings />
                <Text>Manage Categories</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            {/* REQUESTS PANEL */}
            <TabPanel p={0}>
              <Card
                bg="white"
                borderRadius="2xl"
                boxShadow="sm"
                border="1px solid"
                borderColor="gray.100"
                overflow="hidden"
              >
                <CardBody p={0}>
                  <Table variant="simple">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th py={5} color="gray.500">
                          Provider Name
                        </Th>
                        <Th py={5} color="gray.500">
                          Email Address
                        </Th>
                        <Th py={5} color="gray.500">
                          Status
                        </Th>
                        <Th py={5} color="gray.500" isNumeric>
                          Action
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredRequests.length > 0 ? (
                        filteredRequests.map((req) => (
                          <Tr
                            key={req.id}
                            _hover={{ bg: "gray.50" }}
                            transition="all 0.2s"
                            borderBottom="1px solid"
                            borderColor="gray.100"
                          >
                            <Td py={5}>
                              <HStack spacing={3}>
                                <Avatar
                                  size="sm"
                                  name={req.businessName || req.user?.name}
                                  bg="green.100"
                                  color="green.700"
                                />
                                <VStack align="start" spacing={0}>
                                  <Text fontWeight="bold" color="gray.800">
                                    {req.businessName ||
                                      req.user?.name ||
                                      "N/A"}
                                  </Text>
                                  <Text fontSize="xs" color="gray.500">
                                    ID: {req.id}
                                  </Text>
                                </VStack>
                              </HStack>
                            </Td>
                            <Td color="gray.600">{req.user?.email || "-"}</Td>
                            <Td>
                              <HStack>
                                <Badge
                                  px={3}
                                  py={1}
                                  borderRadius="full"
                                  fontSize="xs"
                                  variant="subtle"
                                  colorScheme={
                                    req.status === "PENDING"
                                      ? "yellow"
                                      : req.status === "APPROVED"
                                        ? "green"
                                        : "red"
                                  }
                                >
                                  {req.status}
                                </Badge>
                                {/* Show Expired Badge if needed */}
                                {hasExpiredLicense(req) && (
                                  <Badge
                                    px={2}
                                    py={1}
                                    borderRadius="full"
                                    fontSize="xs"
                                    colorScheme="red"
                                    variant="solid"
                                  >
                                    LICENSE EXPIRED
                                  </Badge>
                                )}
                              </HStack>
                            </Td>
                            <Td isNumeric>
                              <Button
                                size="sm"
                                rightIcon={<FiChevronRight />}
                                colorScheme="gray"
                                variant="ghost"
                                onClick={() =>
                                  router.push(
                                    `/admin/provider-requests/${req.id}`,
                                  )
                                }
                              >
                                View Details
                              </Button>
                            </Td>
                          </Tr>
                        ))
                      ) : (
                        <Tr>
                          <Td colSpan={4} textAlign="center" py={10}>
                            <VStack spacing={3}>
                              <Box p={4} bg="gray.50" borderRadius="full">
                                <Icon
                                  as={FiFileText}
                                  w={8}
                                  h={8}
                                  color="gray.400"
                                />
                              </Box>
                              <Text color="gray.500">
                                No requests found for this filter.
                              </Text>
                            </VStack>
                          </Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </CardBody>
              </Card>
            </TabPanel>

            {/* CATEGORIES PANEL */}
            <TabPanel p={0}>
              <Card
                bg="white"
                borderRadius="2xl"
                boxShadow="sm"
                border="1px solid"
                borderColor="gray.100"
              >
                <CardBody>
                  <Heading size="md" mb={6} color="gray.800">
                    Category Management
                  </Heading>
                  <CategoryManager />
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </Box>
  );
}
