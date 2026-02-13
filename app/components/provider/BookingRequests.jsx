"use client";

import { useState, useMemo, useEffect } from "react";
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
  Card,
  CardBody,
  CardFooter,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Input,
  InputGroup,
  InputLeftElement,
  useToast,
  Avatar,
  IconButton,
  Spacer,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiUsers,
  FiList,
  FiSearch,
  FiFilter,
  FiMessageSquare,
} from "react-icons/fi";

const MotionBox = motion(Box);

export default function BookingRequests({ onBack, onMessage }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const bg = useColorModeValue("white", "gray.800");
  const toast = useToast();

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings");
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (error) {
      console.error("Failed to fetch bookings", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const onUpdateStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast({ title: `Booking ${status}`, status: "success" });
        fetchBookings();
      } else {
        toast({ title: "Failed to update", status: "error" });
      }
    } catch (error) {
      toast({ title: "Error updating booking", status: "error" });
    }
  };

  // Filter bookings based on Tabs and Search
  const filterBookings = (statusGroup) => {
    return bookings.filter((b) => {
      // 1. Status Filter
      let statusMatch = false;
      if (statusGroup === "PENDING") {
        statusMatch = b.status === "PENDING";
      } else if (statusGroup === "UPCOMING") {
        // Confirmed and future date? For now just CONFIRMED
        statusMatch = b.status === "CONFIRMED";
      } else if (statusGroup === "PAST") {
        statusMatch =
          b.status === "REJECTED" ||
          b.status === "COMPLETED" ||
          b.status === "CANCELLED";
      } else {
        statusMatch = true; // All
      }

      // 2. Search Filter (Service Title or Seeker Name)
      const searchMatch =
        b.service?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.seeker?.name?.toLowerCase().includes(searchQuery.toLowerCase());

      return statusMatch && searchMatch;
    });
  };

  const BookingList = ({ statusGroup }) => {
    const filtered = filterBookings(statusGroup);

    if (filtered.length === 0) {
      return (
        <Flex
          justify="center"
          align="center"
          direction="column"
          h="300px"
          bg="gray.50"
          rounded="xl"
          border="2px dashed"
          borderColor="gray.200"
        >
          <Icon as={FiList} boxSize={10} color="gray.300" mb={4} />
          <Text color="gray.500">No bookings found in this category.</Text>
        </Flex>
      );
    }

    return (
      <SimpleGrid columns={{ base: 1, lg: 2, xl: 3 }} spacing={6}>
        <AnimatePresence>
          {filtered.map((booking, index) => {
            const statusColor =
              booking.status === "CONFIRMED"
                ? "green.400"
                : booking.status === "REJECTED"
                  ? "red.400"
                  : "orange.400";

            const statusBg =
              booking.status === "CONFIRMED"
                ? "green.50"
                : booking.status === "REJECTED"
                  ? "red.50"
                  : "orange.50";

            const statusBadgeColor =
              booking.status === "CONFIRMED"
                ? "green"
                : booking.status === "REJECTED"
                  ? "red"
                  : "orange";

            return (
              <MotionBox
                key={booking.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.05,
                  ease: "easeOut",
                }}
                whileHover={{ y: -8 }}
              >
                <Card
                  h="full"
                  variant="outline"
                  borderRadius="2xl"
                  overflow="hidden"
                  border="1px solid"
                  borderColor="gray.100"
                  boxShadow="sm"
                  _hover={{ boxShadow: "2xl", borderColor: "transparent" }}
                  transition="all 0.3s ease"
                  bg="white"
                  position="relative"
                >
                  {/* Status Indicator Bar */}
                  <Box
                    h="6px"
                    bgGradient={`linear(to-r, ${statusColor}, ${statusColor})`}
                    w="full"
                    position="absolute"
                    top={0}
                    left={0}
                  />

                  <CardBody p={6} pt={8}>
                    {/* Header */}
                    <Flex justify="space-between" align="start" mb={4}>
                      <Badge
                        colorScheme={statusBadgeColor}
                        variant="subtle"
                        px={3}
                        py={1}
                        borderRadius="full"
                        fontSize="xs"
                        fontWeight="bold"
                        letterSpacing="wide"
                      >
                        {booking.status}
                      </Badge>
                      <Text
                        fontSize="xl"
                        fontWeight="800"
                        color="green.600"
                        letterSpacing="tight"
                      >
                        AED {booking.service?.price}
                      </Text>
                    </Flex>

                    {/* Service Title */}
                    <VStack align="start" spacing={1} mb={6}>
                      <Heading
                        size="md"
                        color="gray.800"
                        noOfLines={2}
                        lineHeight="1.4"
                        fontWeight="700"
                      >
                        {booking.service?.title}
                      </Heading>
                      <Text
                        fontSize="xs"
                        color="gray.400"
                        fontWeight="bold"
                        textTransform="uppercase"
                        letterSpacing="1px"
                      >
                        {booking.service?.category?.name || "Service"}
                      </Text>
                    </VStack>

                    <Divider borderColor="gray.100" mb={6} />

                    {/* Meta Data Grid */}
                    <SimpleGrid columns={2} spacing={5} mb={6}>
                      <Flex direction="column" gap={1}>
                        <Flex align="center" gap={2} color="gray.400" mb={1}>
                          <Icon as={FiCalendar} boxSize={4} />
                          <Text
                            fontSize="xs"
                            fontWeight="bold"
                            letterSpacing="wide"
                          >
                            DATE
                          </Text>
                        </Flex>
                        <Text fontSize="sm" fontWeight="600" color="gray.700">
                          {new Date(booking.date).toLocaleDateString(
                            undefined,
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </Text>
                      </Flex>

                      <Flex direction="column" gap={1}>
                        <Flex align="center" gap={2} color="gray.400" mb={1}>
                          <Icon as={FiClock} boxSize={4} />
                          <Text
                            fontSize="xs"
                            fontWeight="bold"
                            letterSpacing="wide"
                          >
                            TIME
                          </Text>
                        </Flex>
                        <Text fontSize="sm" fontWeight="600" color="gray.700">
                          {booking.time}
                        </Text>
                      </Flex>
                    </SimpleGrid>

                    {/* Seeker Profile */}
                    <HStack
                      bg="gray.50"
                      p={3}
                      borderRadius="xl"
                      spacing={3}
                      border="1px dashed"
                      borderColor="gray.200"
                    >
                      <Avatar
                        size="sm"
                        name={
                          booking.seeker?.name ||
                          booking.seeker?.email ||
                          "Unknown"
                        }
                        src={booking.seeker?.image}
                        border="2px solid white"
                        boxShadow="sm"
                      />
                      <Box>
                        <Text fontSize="sm" fontWeight="bold" color="gray.700">
                          {booking.seeker?.name ||
                            booking.seeker?.email ||
                            "Unknown Seeker"}
                        </Text>
                        <Text
                          fontSize="xs"
                          color="gray.500"
                          fontWeight="medium"
                        >
                          {booking.seeker?.mobile || "No mobile"}
                        </Text>
                      </Box>
                      <Spacer />
                      <IconButton
                        icon={<FiMessageSquare />}
                        size="sm"
                        colorScheme="blue"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMessage(booking.seeker);
                        }}
                        aria-label="Message Seeker"
                        borderRadius="full"
                        bg="white"
                        boxShadow="sm"
                        _hover={{ bg: "blue.50", color: "blue.600" }}
                      />
                    </HStack>
                  </CardBody>

                  {/* Actions Footer */}
                  {booking.status === "PENDING" && (
                    <CardFooter
                      p={4}
                      bg="gray.50"
                      borderTop="1px solid"
                      borderColor="gray.100"
                    >
                      <Flex w="full" gap={3}>
                        <Button
                          flex={1}
                          bg="green.500"
                          color="white"
                          size="md"
                          fontSize="sm"
                          fontWeight="600"
                          _hover={{
                            bg: "green.600",
                            transform: "translateY(-1px)",
                            boxShadow: "md",
                          }}
                          _active={{ transform: "translateY(0)" }}
                          transition="all 0.2s"
                          onClick={() =>
                            onUpdateStatus(booking.id, "CONFIRMED")
                          }
                          shadow="sm"
                        >
                          Accept Request
                        </Button>
                        <Button
                          flex={1}
                          variant="outline"
                          colorScheme="red"
                          size="md"
                          fontSize="sm"
                          fontWeight="600"
                          border="1px solid"
                          borderColor="red.200"
                          _hover={{ bg: "red.50", borderColor: "red.300" }}
                          onClick={() => onUpdateStatus(booking.id, "REJECTED")}
                        >
                          Decline
                        </Button>
                      </Flex>
                    </CardFooter>
                  )}
                </Card>
              </MotionBox>
            );
          })}
        </AnimatePresence>
      </SimpleGrid>
    );
  };

  return (
    <Container maxW="container.xl" py={8}>
      {/* Header Section */}
      <Flex
        justify="space-between"
        align="center"
        mb={6}
        direction={{ base: "column", md: "row" }}
        gap={4}
      >
        <VStack align="start" spacing={1} w="full">
          <Button
            variant="ghost"
            onClick={onBack}
            leftIcon={<FiArrowLeft />}
            _hover={{ bg: "gray.100", color: "green.600" }}
            mb={2}
            size="sm"
          >
            Back to Dashboard
          </Button>
          <Heading color="gray.800" size="lg">
            Booking Requests
          </Heading>
          <Text color="gray.500">Manage your incoming and scheduled jobs.</Text>
        </VStack>

        {/* Search Bar */}
        <InputGroup maxW={{ base: "full", md: "300px" }}>
          <InputLeftElement pointerEvents="none">
            <Icon as={FiSearch} color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search bookings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            bg="white"
            borderRadius="full"
            focusBorderColor="green.500"
          />
        </InputGroup>
      </Flex>

      {loading ? (
        <Flex justify="center" h="400px" align="center">
          <Spinner size="xl" color="green.500" thickness="4px" />
        </Flex>
      ) : (
        <Tabs variant="soft-rounded" colorScheme="green" isLazy>
          <TabList mb={6} overflowX="auto" py={2}>
            <Tab
              fontWeight="bold"
              _selected={{ color: "white", bg: "green.500" }}
            >
              Pending ({bookings.filter((b) => b.status === "PENDING").length})
            </Tab>
            <Tab
              fontWeight="bold"
              _selected={{ color: "white", bg: "green.500" }}
            >
              Upcoming (
              {bookings.filter((b) => b.status === "CONFIRMED").length})
            </Tab>
            <Tab
              fontWeight="bold"
              _selected={{ color: "white", bg: "green.500" }}
            >
              Past/Rejected
            </Tab>
            <Tab
              fontWeight="bold"
              _selected={{ color: "white", bg: "green.500" }}
            >
              All Bookings
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel px={0}>
              <BookingList statusGroup="PENDING" />
            </TabPanel>
            <TabPanel px={0}>
              <BookingList statusGroup="UPCOMING" />
            </TabPanel>
            <TabPanel px={0}>
              <BookingList statusGroup="PAST" />
            </TabPanel>
            <TabPanel px={0}>
              <BookingList statusGroup="ALL" />
            </TabPanel>
          </TabPanels>
        </Tabs>
      )}
    </Container>
  );
}
