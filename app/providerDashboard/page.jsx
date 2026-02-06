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
  HStack,
  useColorModeValue,
  IconButton,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Avatar,
  Divider,
  useToast,
  Textarea,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import PostService from "../components/PostServices";
import { useState, useEffect, useRef } from "react";
import {
  FiGrid,
  FiList,
  FiPlusCircle,
  FiArrowLeft,
  FiClock,
  FiCheckCircle,
  FiTrendingUp,
  FiUsers,
  FiEye,
  FiStar,
  FiBriefcase,
  FiMoreHorizontal,
  FiSend,
  FiMessageSquare,
} from "react-icons/fi";
import ChatBox from "@/app/components/ChatBox"; // Ensure path is correct

function ClarificationChat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const bottomRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/provider/clarifications");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setMessages(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const res = await fetch("/api/provider/clarifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMessage }),
      });
      if (res.ok) {
        setNewMessage("");
        fetchMessages();
      } else {
        toast({ title: "Failed to send", status: "error" });
      }
    } catch (error) {
      toast({ title: "Failed to send", status: "error" });
    }
  };

  if (loading && messages.length === 0) return <Spinner size="sm" />;
  if (messages.length === 0) return null; // Don't show if no conversation

  return (
    <Box mt={6} w="full" maxW="600px" mx="auto" textAlign="left">
      <Heading size="md" mb={4} color="gray.700">
        Admin Messages / Clarifications
      </Heading>
      <Box
        bg="white"
        borderRadius="xl"
        border="1px solid"
        borderColor="gray.200"
        h="400px"
        display="flex"
        flexDirection="column"
      >
        <Box flex="1" overflowY="auto" p={4}>
          <VStack spacing={4} align="stretch">
            {messages.map((msg) => (
              <Flex
                key={msg.id}
                justify={msg.sender === "PROVIDER" ? "flex-end" : "flex-start"}
              >
                <Box
                  maxW="80%"
                  bg={msg.sender === "PROVIDER" ? "green.100" : "gray.100"}
                  color="gray.800"
                  p={3}
                  borderRadius="lg"
                  borderTopRightRadius={msg.sender === "PROVIDER" ? "0" : "lg"}
                  borderTopLeftRadius={msg.sender === "ADMIN" ? "0" : "lg"}
                >
                  <Text fontSize="sm">{msg.message}</Text>
                  <Text fontSize="xs" color="gray.500" mt={1} textAlign="right">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </Box>
              </Flex>
            ))}
            <div ref={bottomRef} />
          </VStack>
        </Box>
        <Divider />
        <Flex p={3} gap={2}>
          <Textarea
            placeholder="Type your reply..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            rows={2}
            resize="none"
            borderRadius="md"
          />
          <IconButton
            icon={<FiSend />}
            colorScheme="green"
            aria-label="Send"
            onClick={sendMessage}
            h="auto"
          />
        </Flex>
      </Box>
    </Box>
  );
}

export default function ProviderDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeView, setActiveView] = useState("home"); // home, requests, services, post, messages
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const bg = useColorModeValue("gray.50", "gray.900");

  if (status === "loading")
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner color="green.500" size="xl" />
      </Flex>
    );

  const user = session?.user;
  if (!user) return null;

  /* ================= STATUS CHECKS ================= */
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
          mb={6}
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
        <ClarificationChat />
      </Box>
    );
  }

  if (
    user.providerRequestStatus === "rejected" ||
    user.providerRequestStatus === "REJECTED"
  ) {
    return <RejectedView />;
  }

  /* ================= DASHBOARD ROUTING ================= */

  const renderContent = () => {
    switch (activeView) {
      case "requests":
        return <RequestsView onBack={() => setActiveView("home")} />;
      case "services":
        return <ServicesView onBack={() => setActiveView("home")} />;
      case "messages":
        return <MessagesView onBack={() => setActiveView("home")} onSelectChat={setSelectedChatUser} />;
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
        return <DashboardOverview user={user} onNavigate={setActiveView} />;
    }
  };

  return (
    <Box minH="100vh" bg={bg} marginTop={"70px"} pb={10}>
      <Container maxW="container.xl" py={8}>
        {renderContent()}
      </Container>
      
      <ChatBox 
        isOpen={!!selectedChatUser}
        onClose={() => setSelectedChatUser(null)}
        otherUserId={selectedChatUser?.id}
        otherUserName={selectedChatUser?.name}
        otherUserAvatar={selectedChatUser?.image}
      />
    </Box>
  );
}

// ---------------- DASHBOARD OVERVIEW (NEW) ---------------- //

function DashboardOverview({ user, onNavigate }) {
  const router = useRouter();
  // Mock Data for Stats
  const [stats, setStats] = useState({
    revenue: 12500,
    activeJobs: 3,
    views: 450,
    rating: 4.8,
  });

  return (
    <VStack spacing={8} align="stretch">
      {/* Header */}
      <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
        <Box>
          <Heading size="lg" color="gray.800" mb={1}>
            Overview
          </Heading>
          <Text color="gray.500">
            Welcome back, {user.name}. Here's what's happening today.
          </Text>
        </Box>
        <HStack>
          <Button
            leftIcon={<FiPlusCircle />}
            colorScheme="green"
            onClick={() => onNavigate("post")}
          >
            Post New Service
          </Button>
        </HStack>
      </Flex>

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        <StatCard
          label="Total Revenue"
          value={`$${stats.revenue.toLocaleString()}`}
          helperText="Total Earnings"
          icon={FiTrendingUp}
          color="green"
          trend="+12%"
        />
        <StatCard
          label="Active Jobs"
          value={stats.activeJobs}
          helperText="In Progress"
          icon={FiBriefcase}
          color="blue"
        />
        <StatCard
          label="Profile Views"
          value={stats.views}
          helperText="Last 30 Days"
          icon={FiEye}
          color="purple"
          trend="+5%"
        />
        <StatCard
          label="Avg. Rating"
          value={stats.rating}
          helperText="From 24 reviews"
          icon={FiStar}
          color="orange"
        />
      </SimpleGrid>

      {/* Main Content Grid */}
      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
        {/* Left Column (Content) */}
        <Box gridColumn={{ lg: "span 2" }}>
          <VStack spacing={6} align="stretch" h="full">
            {/* Recent Requests Card */}
            <Card borderRadius="xl" boxShadow="sm" flex="1">
              <CardHeader pb={0}>
                <Flex justify="space-between" align="center">
                  <Heading size="md" color="gray.700">
                    Recent Requests
                  </Heading>
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="green"
                    onClick={() => onNavigate("requests")}
                  >
                    View All
                  </Button>
                </Flex>
              </CardHeader>
              <CardBody>
                <RequestsPreview onNavigate={onNavigate} />
              </CardBody>
            </Card>

            {/* Services Card */}
            <Card borderRadius="xl" boxShadow="sm">
              <CardHeader pb={0}>
                <Flex justify="space-between" align="center">
                  <Heading size="md" color="gray.700">
                    Your Services
                  </Heading>
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="green"
                    onClick={() => onNavigate("services")}
                  >
                    Manage All
                  </Button>
                </Flex>
              </CardHeader>
              <CardBody>
                <ServicesPreviewPreview />
              </CardBody>
            </Card>
          </VStack>
        </Box>

        {/* Right Column (Sidebar) */}
        <Box>
          <VStack spacing={6} align="stretch">
            {/* Quick Actions Grid */}
            <Card borderRadius="xl" boxShadow="sm">
              <CardHeader>
                <Heading size="sm" color="gray.600">
                  Quick Actions
                </Heading>
              </CardHeader>
              <CardBody pt={0}>
                <SimpleGrid columns={2} spacing={3}>
                  <Button
                    height="80px"
                    flexDirection="column"
                    gap={2}
                    variant="outline"
                    borderRadius="xl"
                    onClick={() => onNavigate("requests")}
                    _hover={{ bg: "blue.50", borderColor: "blue.200" }}
                  >
                    <Icon as={FiList} color="blue.500" boxSize={5} />
                    <Text fontSize="xs">Requests</Text>
                  </Button>
                  <Button
                    height="80px"
                    flexDirection="column"
                    gap={2}
                    variant="outline"
                    borderRadius="xl"
                    onClick={() => onNavigate("services")}
                    _hover={{ bg: "green.50", borderColor: "green.200" }}
                  >
                    <Icon as={FiBriefcase} color="green.500" boxSize={5} />
                    <Text fontSize="xs">Services</Text>
                  </Button>
                  <Button
                    height="80px"
                    flexDirection="column"
                    gap={2}
                    variant="outline"
                    borderRadius="xl"
                    _hover={{ bg: "purple.50", borderColor: "purple.200" }}
                  >
                    <Icon as={FiUsers} color="purple.500" boxSize={5} />
                    <Text fontSize="xs">Reviews</Text>
                  </Button>
                  <Button
                    height="80px"
                    flexDirection="column"
                    gap={2}
                    variant="outline"
                    borderRadius="xl"
                    onClick={() => router.push("/profile")}
                    _hover={{ bg: "orange.50", borderColor: "orange.200" }}
                  >
                    <Icon as={FiUsers} color="orange.500" boxSize={5} />
                    <Text fontSize="xs">Profile</Text>
                  </Button>
                  <Button
                    height="80px"
                    flexDirection="column"
                    gap={2}
                    variant="outline"
                    borderRadius="xl"
                    onClick={() => onNavigate("messages")}
                    _hover={{ bg: "teal.50", borderColor: "teal.200" }}
                  >
                    <Icon as={FiMessageSquare} color="teal.500" boxSize={5} />
                    <Text fontSize="xs">Messages</Text>
                  </Button>
                </SimpleGrid>
              </CardBody>
            </Card>

            {/* Pro Tip */}
            <Card
              borderRadius="xl"
              bgGradient="linear(to-br, blue.50, white)"
              border="1px solid"
              borderColor="blue.100"
              boxShadow="none"
            >
              <CardBody>
                <Flex mb={3} align="center">
                  <Box p={2} bg="blue.100" borderRadius="lg" mr={3}>
                    <Icon as={FiClock} color="blue.600" />
                  </Box>
                  <Text fontWeight="bold" color="blue.700" fontSize="sm">
                    Pro Tip
                  </Text>
                </Flex>
                <Text fontSize="sm" color="gray.600" lineHeight="tall">
                  Updating your service photos regularly can increase your
                  profile views by up to approximately 30%.
                </Text>
              </CardBody>
            </Card>
          </VStack>
        </Box>
      </SimpleGrid>
    </VStack>
  );
}

function StatCard({ label, value, helperText, icon, color, trend }) {
  return (
    <Card
      borderRadius="xl"
      boxShadow="sm"
      borderTop="4px solid"
      borderColor={`${color}.400`}
    >
      <CardBody>
        <Flex justify="space-between" align="start" mb={2}>
          <Stat>
            <StatLabel color="gray.500">{label}</StatLabel>
            <StatNumber fontSize="2xl" fontWeight="bold" color="gray.700">
              {value}
            </StatNumber>
            <StatHelpText mb={0}>
              {trend && <StatArrow type="increase" />}
              {helperText}
            </StatHelpText>
          </Stat>
          <Box p={2} bg={`${color}.50`} borderRadius="lg">
            <Icon as={icon} color={`${color}.500`} boxSize={5} />
          </Box>
        </Flex>
      </CardBody>
    </Card>
  );
}

function RequestsPreview({ onNavigate }) {
  // Using simplified logic from RequestsView but only showing top 3
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await fetch("/api/provider/jobs");
        if (res.ok) {
          const data = await res.json();
          setJobs(Array.isArray(data) ? data.slice(0, 3) : []);
        }
      } catch (error) {
        console.error("Failed to fetch jobs", error);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  if (loading)
    return (
      <Flex p={6} justify="center">
        <Spinner color="green.500" />
      </Flex>
    );
  if (jobs.length === 0)
    return (
      <Box p={6} textAlign="center">
        <Text color="gray.500">No active requests.</Text>
      </Box>
    );

  return (
    <VStack divider={<Divider />} spacing={0} align="stretch">
      {jobs.map((job) => (
        <Flex
          key={job.id}
          p={4}
          justify="space-between"
          align="center"
          _hover={{ bg: "gray.50" }}
          transition="bg 0.2s"
        >
          <Box>
            <Text fontWeight="bold" color="gray.700" noOfLines={1}>
              {job.title || "Request"}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {job.description
                ? job.description.substring(0, 50) + "..."
                : "No details"}
            </Text>
          </Box>
          <Badge colorScheme="green">{job.status || "New"}</Badge>
        </Flex>
      ))}
      <Box p={2} textAlign="center">
        <Button
          size="xs"
          variant="ghost"
          colorScheme="green"
          onClick={() => onNavigate("requests")}
        >
          View All Activity
        </Button>
      </Box>
    </VStack>
  );
}

function ServicesPreviewPreview() {
  // Just a quick visual placeholder using simplified fetch
  const [count, setCount] = useState(null);

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch("/api/services?mine=true");
        if (res.ok) {
          const data = await res.json();
          setCount(data.length);
        }
      } catch (e) {}
    }
    fetchServices();
  }, []);

  return (
    <Flex align="center" justify="space-between">
      <HStack>
        <Box p={3} bg="green.50" borderRadius="full">
          <Icon as={FiBriefcase} color="green.500" />
        </Box>
        <Box>
          <Text fontWeight="bold" color="gray.700">
            Active Services
          </Text>
          <Text fontSize="sm" color="gray.500">
            Currently listed on platform
          </Text>
        </Box>
      </HStack>
      <Text fontSize="2xl" fontWeight="bold" color="green.600">
        {count !== null ? count : "-"}
      </Text>
    </Flex>
  );
}

// ---------------- EXISTING SUB-COMPONENTS (Modified Style) ---------------- //

function RequestsView({ onBack }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await fetch("/api/provider/jobs");
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
    <Box mt={6}>
      <Button
        position={"absolute"}
        top={"0"}
        left={"0"}
        variant="ghost"
        colorScheme="black"
        onClick={onBack}
        leftIcon={<FiArrowLeft />}
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
            <Card
              key={job.id || idx}
              borderRadius="xl"
              boxShadow="md"
              borderLeft="4px solid"
              borderColor="green.400"
              overflow="hidden"
            >
              <CardBody>
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
              </CardBody>
            </Card>
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
    <Box mt={6}>
      <Button
        position={"absolute"}
        top={"0"}
        left={"0"}
        variant="ghost"
        colorScheme="black"
        onClick={onBack}
        leftIcon={<FiArrowLeft />}
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
            <Card
              key={service.id}
              borderRadius="xl"
              boxShadow="md"
              overflow="hidden"
              _hover={{ boxShadow: "xl", transform: "translateY(-2px)" }}
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
              <CardBody p={5}>
                <Heading size="md" mb={2} color="gray.700" noOfLines={1}>
                  {service.title}
                </Heading>
                <Text fontSize="sm" color="gray.500" noOfLines={2} mb={3}>
                  {service.description}
                </Text>
                <Flex justify="space-between" align="center">
                  <Badge
                    colorScheme={service.status === "BLOCKED" ? "red" : "green"}
                  >
                    {service.status === "BLOCKED"
                      ? "BLOCKED (License Expired)"
                      : "ACTIVE"}
                  </Badge>
                  <Text fontWeight="bold" color="green.600">
                    ₹{service.price}
                  </Text>
                </Flex>
              </CardBody>
              {service.status === "BLOCKED" && (
                <CardFooter bg="red.50" p={3}>
                  <Text fontSize="xs" color="red.600">
                    Linked license has expired. Please renew it in your profile
                    to re-activate this service.
                  </Text>
                </CardFooter>
              )}
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}

function MessagesView({ onBack, onSelectChat }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConversations() {
      try {
        const res = await fetch("/api/messages");
        if (res.ok) {
          const data = await res.json();
          setConversations(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Error fetching conversations", error);
      } finally {
        setLoading(false);
      }
    }
    fetchConversations();
  }, []);

  return (
    <Box mt={6}>
      <Button
        position={"absolute"}
        top={"0"}
        left={"0"}
        variant="ghost"
        colorScheme="black"
        onClick={onBack}
        leftIcon={<FiArrowLeft />}
      >
        Back to Dashboard
      </Button>
      <Heading mb={6} color="green.600">
        Messages
      </Heading>

      {loading ? (
        <Flex justify="center" p={10}>
          <Spinner color="green.500" />
        </Flex>
      ) : conversations.length === 0 ? (
        <Box
          bg="white"
          p={10}
          borderRadius="xl"
          boxShadow="sm"
          textAlign="center"
        >
          <Text color="gray.500">No conversations yet.</Text>
        </Box>
      ) : (
        <VStack spacing={4} align="stretch">
          {conversations.map((user) => (
            <Flex
              key={user.id}
              bg="white"
              p={4}
              borderRadius="xl"
              boxShadow="sm"
              align="center"
              justify="space-between"
              cursor="pointer"
              _hover={{ bg: "gray.50" }}
              onClick={() => onSelectChat(user)}
            >
              <HStack spacing={4}>
                <Avatar name={user.name} src={user.image} />
                <Box>
                  <Text fontWeight="bold" color="gray.700">
                    {user.name}
                  </Text>
                  <Text fontSize="sm" color="gray.500" noOfLines={1}>
                    {user.lastMessage || "Click to view chat"}
                  </Text>
                </Box>
              </HStack>
              <Text fontSize="xs" color="gray.400">
                {user.timestamp
                  ? new Date(user.timestamp).toLocaleDateString()
                  : ""}
              </Text>
            </Flex>
          ))}
        </VStack>
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
