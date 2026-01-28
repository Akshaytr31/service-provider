"use client";

import {
  Box,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Icon,
  Flex,
  Badge,
  Spinner,
  Container,
  VStack,
  useColorModeValue,
  IconButton,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import PostService from "../components/PostServices";
import { useState, useEffect } from "react";
import {
  FiGrid,
  FiList,
  FiPlusCircle,
  FiArrowLeft,
  FiClock,
  FiCheckCircle,
} from "react-icons/fi";

export default function ProviderDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeView, setActiveView] = useState("home"); // home, requests, services, post
  const bg = useColorModeValue("gray.50", "gray.900");

  if (status === "loading")
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner color="green.500" size="xl" />
      </Flex>
    );

  const user = session?.user;
  if (!user) return null;

  /* ================= STATUS: NONE ================= */
  if (user.providerRequestStatus === "none") {
    return (
      <Box p={20} textAlign="center">
        <Heading mb={4} color="green.600">
          Pending Provider Registration
        </Heading>
        <Text fontSize="lg" color="gray.600">
          You need to complete onboarding before accessing the provider
          dashboard.
        </Text>
      </Box>
    );
  }

  /* ================= STATUS: PENDING ================= */
  if (user.providerRequestStatus === "PENDING") {
    return (
      <Box p={6} marginTop={"70px"} textAlign="center">
        <Box
          bg="orange.50"
          p={10}
          borderRadius="xl"
          border="1px solid"
          borderColor="orange.100"
          display="inline-block"
        >
          <Icon as={FiClock} boxSize={12} color="orange.400" mb={4} />
          <Heading size="lg" color="orange.600" mb={2}>
            Approval Pending
          </Heading>
          <Text color="gray.600">
            Your provider request is currently under admin review. Please check
            back later.
          </Text>
        </Box>
      </Box>
    );
  }

  /* ================= STATUS: REJECTED ================= */
  if (
    user.providerRequestStatus === "rejected" ||
    user.providerRequestStatus === "REJECTED"
  ) {
    return <RejectedView />;
  }

  /* ================= STATUS: APPROVED (DASHBOARD) ================= */

  const renderContent = () => {
    switch (activeView) {
      case "requests":
        return <RequestsView onBack={() => setActiveView("home")} />;
      case "services":
        return <ServicesView onBack={() => setActiveView("home")} />;
      case "post":
        return (
          <Box>
            <Button
              leftIcon={<FiArrowLeft />}
              variant="ghost"
              mb={4}
              onClick={() => setActiveView("home")}
            >
              Back to Dashboard
            </Button>
            <PostService />
          </Box>
        );
      default:
        return <DashboardHome user={user} onNavigate={setActiveView} />;
    }
  };

  return (
    <Box minH="100vh" bg={bg} marginTop={"70px"}>
      <Container maxW="container.xl" py={10}>
        {renderContent()}
      </Container>
    </Box>
  );
}

// ---------------- SUB-COMPONENTS ---------------- //

function DashboardHome({ user, onNavigate }) {
  return (
    <Stack spacing={8}>
      <Box>
        <Heading color="green.600" mb={2}>
          Welcome back, {user.name || "Provider"}!
        </Heading>
        <Text color="gray.500">
          Manage your services and requests from here.
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
        <DashboardTile
          title="Seeker Requests"
          description="View and manage all incoming requests from seekers."
          icon={FiList}
          color="blue"
          onClick={() => onNavigate("requests")}
        />
        <DashboardTile
          title="Posted Services"
          description="View your active services listed on the platform."
          icon={FiCheckCircle}
          color="green"
          onClick={() => onNavigate("services")}
        />
        <DashboardTile
          title="Post New Service"
          description="Create and publish a new service listing."
          icon={FiPlusCircle}
          color="purple"
          onClick={() => onNavigate("post")}
        />
      </SimpleGrid>
    </Stack>
  );
}

function DashboardTile({ title, description, icon, color, onClick }) {
  return (
    <Box
      bg="white"
      p={8}
      borderRadius="2xl"
      boxShadow="lg"
      cursor="pointer"
      transition="all 0.3s ease"
      _hover={{ transform: "translateY(-5px)", boxShadow: "xl" }}
      onClick={onClick}
      borderTop="4px solid"
      borderColor={`${color}.400`}
    >
      <Flex align="center" mb={4}>
        <Box bg={`${color}.50`} p={3} borderRadius="lg" mr={4}>
          <Icon as={icon} boxSize={6} color={`${color}.500`} />
        </Box>
        <Heading size="md" color="gray.700">
          {title}
        </Heading>
      </Flex>
      <Text color="gray.500" fontSize="sm">
        {description}
      </Text>
    </Box>
  );
}

function RequestsView({ onBack }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch jobs/requests meant for this provider
    async function fetchJobs() {
      try {
        const res = await fetch("/api/provider/jobs"); // Assuming this endpoint exists/works
        if (res.ok) {
          const data = await res.json();
          setJobs(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to fetch jobs", error);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  return (
    <Box>
      <Button
        leftIcon={<FiArrowLeft />}
        variant="ghost"
        mb={6}
        onClick={onBack}
      >
        Back to Dashboard
      </Button>
      <Heading mb={6} color="green.600">
        Seeker Requests
      </Heading>

      {loading ? (
        <Flex justify="center" p={10}>
          <Spinner color="green.500" />
        </Flex>
      ) : jobs.length === 0 ? (
        <Box
          bg="white"
          p={10}
          borderRadius="xl"
          boxShadow="sm"
          textAlign="center"
        >
          <Text color="gray.500">No requests found at the moment.</Text>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {jobs.map((job, idx) => (
            <Box
              key={job.id || idx}
              bg="white"
              p={6}
              borderRadius="xl"
              boxShadow="md"
              borderLeft="4px solid"
              borderColor="green.400"
            >
              <Heading size="sm" mb={2} color="gray.700">
                {job.title || "Request"}
              </Heading>
              <Text fontSize="sm" color="gray.500" mb={4}>
                {job.description}
              </Text>
              <Flex justify="space-between" align="center">
                <Badge colorScheme="green">{job.status || "Open"}</Badge>
                <Text fontSize="xs" color="gray.400">
                  {new Date(job.createdAt || Date.now()).toLocaleDateString()}
                </Text>
              </Flex>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}

function ServicesView({ onBack }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch("/api/services?mine=true");
        if (res.ok) {
          const data = await res.json();
          setServices(data);
        }
      } catch (error) {
        console.error("Error fetching services", error);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  return (
    <Box>
      <Button
        leftIcon={<FiArrowLeft />}
        variant="ghost"
        mb={6}
        onClick={onBack}
      >
        Back to Dashboard
      </Button>
      <Heading mb={6} color="green.600">
        My Approved Services
      </Heading>

      {loading ? (
        <Flex justify="center" p={10}>
          <Spinner color="green.500" />
        </Flex>
      ) : services.length === 0 ? (
        <Box
          bg="white"
          p={10}
          borderRadius="xl"
          boxShadow="sm"
          textAlign="center"
        >
          <Text color="gray.500">You haven't posted any services yet.</Text>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {services.map((service) => (
            <Box
              key={service.id}
              bg="white"
              borderRadius="xl"
              boxShadow="md"
              overflow="hidden"
              _hover={{ boxShadow: "xl" }}
              transition="all 0.2s"
            >
              {service.coverPhoto ? (
                <Box
                  h="150px"
                  bgImage={`url(${service.coverPhoto})`}
                  bgSize="cover"
                  bgPos="center"
                />
              ) : (
                <Box
                  h="150px"
                  bg="green.100"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={FiGrid} boxSize={10} color="green.300" />
                </Box>
              )}
              <Box p={5}>
                <Heading size="md" mb={2} color="gray.700" noOfLines={1}>
                  {service.title}
                </Heading>
                <Text fontSize="sm" color="gray.500" noOfLines={2} mb={3}>
                  {service.description}
                </Text>
                <Flex justify="space-between" align="center">
                  <Badge colorScheme="green" variant="subtle">
                    Active
                  </Badge>
                  <Text fontWeight="bold" color="green.600">
                    {service.price}
                  </Text>
                </Flex>
              </Box>
            </Box>
          ))}
        </SimpleGrid>
      )}
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
        const res = await fetch("/api/provider/current-request");
        if (res.ok) {
          const data = await res.json();
          setReason(data.rejectionReason);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchReason();
  }, []);

  return (
    <Box p={10} textAlign="center" marginTop={"170px"}>
      <VStack spacing={6}>
        <Icon as={FiGrid} boxSize={16} color="red.500" />
        <Box>
          <Heading color="red.600" mb={2}>
            Application Rejected
          </Heading>
          <Text fontSize="lg" color="gray.600">
            Your application to become a provider was not approved.
          </Text>
        </Box>

        {loading ? (
          <Spinner color="red.500" />
        ) : (
          <Box
            bg="red.50"
            p={6}
            borderRadius="xl"
            border="1px solid"
            borderColor="red.100"
            maxW="600px"
            w="full"
          >
            <Text fontWeight="bold" color="red.800" mb={1}>
              Reason for Rejection:
            </Text>
            <Text color="red.700">
              {reason || "No specific reason provided."}
            </Text>
          </Box>
        )}

        <Button
          colorScheme="red"
          variant="outline"
          size="lg"
          onClick={() => router.push("/provider-onboarding")}
        >
          Review and Reapply
        </Button>
      </VStack>
    </Box>
  );
}

// Helper to make the code cleaner (Added Stack import to replacement above)
import { Stack } from "@chakra-ui/react";
