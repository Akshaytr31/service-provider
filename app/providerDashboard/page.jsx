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
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Stack,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import PostService from "../components/PostServices";
import { useState, useEffect, useRef } from "react";
import BookingRequests from "../components/provider/BookingRequests";
import { motion } from "framer-motion";
import {
  FiGrid,
  FiList,
  FiPlusCircle,
  FiArrowLeft,
  FiArrowRight,
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
  FiAlertTriangle,
  FiAlertCircle,
  FiCalendar,
} from "react-icons/fi";
import ChatBox from "@/app/components/ChatBox"; // Ensure path is correct
import PrivacyPolicyNotification from "../components/PrivacyPolicyNotification";

function LicenseExpiryAlert() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkLicenses() {
      try {
        const res = await fetch("/api/provider/current-request");
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.licenses)) {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Normalize today

            const newAlerts = [];

            data.licenses.forEach((lic) => {
              if (!lic.expiry) return;

              const expiryDate = new Date(lic.expiry);
              expiryDate.setHours(0, 0, 0, 0); // Normalize expiry

              const diffTime = expiryDate - today;
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              if (diffDays < 0) {
                newAlerts.push({
                  id: lic.name + "expired",
                  status: "error",
                  title: "License Expired",
                  message: `Your license "${lic.name}" has expired. Please update it immediately.`,
                  icon: FiAlertCircle,
                });
              } else if (diffDays <= 7) {
                newAlerts.push({
                  id: lic.name + "warning",
                  status: "warning",
                  title: "License Expiring Soon",
                  message: `Your license "${lic.name}" expires in ${diffDays} day${diffDays !== 1 ? "s" : ""}.`,
                  icon: FiAlertTriangle,
                });
              }
            });
            setAlerts(newAlerts);
          }
        }
      } catch (error) {
        console.error("Failed to check licenses", error);
      } finally {
        setLoading(false);
      }
    }
    checkLicenses();
  }, []);

  if (loading || alerts.length === 0) return null;

  return (
    <Stack spacing={3} mb={6}>
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          status={alert.status}
          variant="subtle"
          borderRadius="lg"
          flexDirection={{ base: "column", sm: "row" }}
          alignItems="flex-start"
          textAlign={{ base: "center", sm: "left" }}
          py={4}
        >
          <AlertIcon as={alert.icon} boxSize="20px" mr={0} />
          <Box flex="1" ml={{ base: 0, sm: 3 }} mt={{ base: 2, sm: 0 }}>
            <AlertTitle mr={2} fontSize="sm" fontWeight="bold">
              {alert.title}
            </AlertTitle>
            <AlertDescription fontSize="sm" maxWidth="sm">
              {alert.message}
            </AlertDescription>
          </Box>
          <Button
            size="sm"
            colorScheme={alert.status === "error" ? "red" : "orange"}
            variant="solid"
            ml={{ base: 0, sm: 4 }}
            mt={{ base: 2, sm: 0 }}
            onClick={() => router.push("/profile")}
          >
            Update
          </Button>
        </Alert>
      ))}
    </Stack>
  );
}

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
        return (
          <RequestsView
            onBack={() => setActiveView("home")}
            onMessage={setSelectedChatUser}
          />
        );
      case "services":
        return <ServicesView onBack={() => setActiveView("home")} />;
      case "messages":
        return (
          <MessagesView
            onBack={() => setActiveView("home")}
            onSelectChat={setSelectedChatUser}
          />
        );
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
      <PrivacyPolicyNotification />
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
      <LicenseExpiryAlert />
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
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBookings() {
      try {
        const res = await fetch("/api/bookings");
        if (res.ok) {
          const data = await res.json();
          setBookings(Array.isArray(data) ? data.slice(0, 3) : []);
        }
      } catch (error) {
        console.error("Failed to fetch bookings", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, []);

  if (loading)
    return (
      <Flex p={6} justify="center">
        <Spinner color="green.500" />
      </Flex>
    );
  if (bookings.length === 0)
    return (
      <Box p={6} textAlign="center">
        <Text color="gray.500">No active requests.</Text>
      </Box>
    );

  return (
    <VStack divider={<Divider />} spacing={0} align="stretch">
      {bookings.map((booking) => (
        <Flex
          key={booking.id}
          p={4}
          justify="space-between"
          align="center"
          _hover={{ bg: "gray.50" }}
          transition="bg 0.2s"
          cursor="pointer"
          onClick={() => onNavigate("requests")}
        >
          <Box>
            <Text fontWeight="bold" color="gray.700" noOfLines={1}>
              {booking.service?.title || "Service Request"}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {booking.seeker?.name || "Seeker"} •{" "}
              {new Date(booking.date).toLocaleDateString()} at {booking.time}
            </Text>
          </Box>
          <Badge
            colorScheme={
              booking.status === "CONFIRMED"
                ? "green"
                : booking.status === "REJECTED"
                  ? "red"
                  : "orange"
            }
          >
            {booking.status}
          </Badge>
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

function RequestsView({ onBack, onMessage }) {
  return <BookingRequests onBack={onBack} onMessage={onMessage} />;
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
                  h="160px"
                  bg="gray.100"
                  bgImage={`url(${service.coverPhoto})`}
                  bgSize="cover"
                  bgPosition="center"
                />
              ) : (
                <Box
                  h="160px"
                  bg="gray.100"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={FiBriefcase} boxSize={8} color="gray.400" />
                </Box>
              )}
              <CardBody>
                <Heading size="sm" mb={2} color="gray.700" noOfLines={1}>
                  {service.title}
                </Heading>
                <Text fontSize="xs" color="gray.500">
                  {service.location || "Online"}
                </Text>
                {service.price && (
                  <Text
                    mt={2}
                    color="green.600"
                    fontWeight="bold"
                    fontSize="sm"
                  >
                    {service.price}
                  </Text>
                )}
                <Badge
                  colorScheme={service.status === "ACTIVE" ? "green" : "red"}
                  mt={2}
                >
                  {service.status}
                </Badge>
              </CardBody>
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
          // API returns array of users with lastMessage property mixed in
          const formatted = Array.isArray(data)
            ? data.map((item) => ({
                id: item.id,
                user: { id: item.id, name: item.name, image: item.image },
                lastMessage: item.lastMessage,
                timestamp: item.timestamp, // Assuming API returns this, or fallback
              }))
            : [];
          setConversations(formatted);
        }
      } catch (error) {
        console.error("Failed to fetch messages", error);
      } finally {
        setLoading(false);
      }
    }
    fetchConversations();
  }, []);

  return (
    <Box mt={6}>
      <Flex align="center" mb={6}>
        <IconButton
          icon={<FiArrowLeft />}
          variant="ghost"
          onClick={onBack}
          mr={4}
          aria-label="Back"
        />
        <Heading size="lg" color="green.700">
          Messages
        </Heading>
      </Flex>

      {loading ? (
        <Flex justify="center" p={10}>
          <Spinner color="green.500" size="xl" />
        </Flex>
      ) : conversations.length === 0 ? (
        <Flex
          direction="column"
          align="center"
          justify="center"
          bg="white"
          p={12}
          borderRadius="2xl"
          boxShadow="sm"
          border="1px solid"
          borderColor="gray.100"
        >
          <Icon as={FiMessageSquare} boxSize={12} color="gray.300" mb={4} />
          <Text color="gray.500" fontSize="lg">
            No messages yet
          </Text>
          <Text color="gray.400" fontSize="sm">
            When seekers contact you, they will appear here.
          </Text>
        </Flex>
      ) : (
        <VStack align="stretch" spacing={4}>
          {conversations.map((conv) => (
            <Flex
              key={conv.id}
              onClick={() => onSelectChat(conv.user)}
              cursor="pointer"
              bg="white"
              p={5}
              borderRadius="xl"
              boxShadow="sm"
              border="1px solid"
              borderColor="gray.100"
              transition="all 0.2s"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "md",
                borderColor: "green.200",
              }}
              align="center"
            >
              <Avatar
                size="md"
                name={conv.user?.name || "Seeker"}
                src={conv.user?.image}
                mr={5}
              />

              <Box flex="1">
                <Flex justify="space-between" align="center" mb={1}>
                  <HStack>
                    <Text fontWeight="bold" fontSize="lg" color="gray.800">
                      {conv.user?.name || "Unknown Seeker"}
                    </Text>
                  </HStack>
                  {conv.timestamp && (
                    <Text fontSize="xs" color="gray.400">
                      {new Date(conv.timestamp).toLocaleDateString()}
                    </Text>
                  )}
                </Flex>

                <Text color="gray.600" noOfLines={1} fontSize="md">
                  {conv.lastMessage || "No messages yet"}
                </Text>
              </Box>

              <Icon as={FiArrowRight} color="gray.300" ml={4} />
            </Flex>
          ))}
        </VStack>
      )}
    </Box>
  );
}

function RejectedView() {
  return (
    <Box p={6} marginTop={"70px"} textAlign="center">
      <Box
        bg="red.50"
        p={10}
        borderRadius="xl"
        border="1px solid"
        borderColor="red.100"
        display="inline-block"
        mb={6}
      >
        <Icon as={FiAlertTriangle} boxSize={12} color="red.400" mb={4} />
        <Heading size="lg" color="red.600" mb={2}>
          Request Rejected
        </Heading>
        <Text color="gray.600" mb={4}>
          Your provider request was rejected. Please check your email or the
          clarification messages below for details.
        </Text>
      </Box>
      <ClarificationChat />
    </Box>
  );
}
