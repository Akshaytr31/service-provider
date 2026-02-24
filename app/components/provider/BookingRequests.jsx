"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearch } from "@/app/context/SearchContext";
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
  FiMessageSquare,
} from "react-icons/fi";
import CancelModal from "./CancelModal";

const MotionBox = motion(Box);

export default function BookingRequests({ onBack, onMessage, initialStatus }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { searchQuery } = useSearch(); // ← driven by the Navbar SearchBox
  const bg = useColorModeValue("white", "gray.800");
  const toast = useToast();

  // Determine initial tab index from status
  const getInitialTabIndex = () => {
    switch (initialStatus) {
      case "PENDING":
        return 0;
      case "UPCOMING":
      case "CONFIRMED":
        return 1;
      case "PAST":
      case "REJECTED":
        return 2;
      case "ALL":
        return 3;
      default:
        return 0;
    }
  };

  const [tabIndex, setTabIndex] = useState(getInitialTabIndex());

  // Update tab if initialStatus changes (e.g. navigation while component mounted)
  useEffect(() => {
    if (initialStatus) {
      setTabIndex(getInitialTabIndex());
    }
  }, [initialStatus]);

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings?role=provider");
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      } else {
        const err = await res.json();
        console.error("Fetch bookings failed:", err);
        toast({
          title: "Failed to fetch bookings",
          description: err.error || res.statusText,
          status: "error",
        });
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

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isCancelOpen, setIsCancelOpen] = useState(false);

  const onUpdateStatus = async (id, status, cancellationReason = null) => {
    try {
      const body = { status };
      if (cancellationReason) body.cancellationReason = cancellationReason;

      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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

  const openCancelModal = (booking) => {
    setSelectedBooking(booking);
    setIsCancelOpen(true);
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
        statusMatch = true;
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
      <SimpleGrid columns={{ base: 1, lg: 2, xl: 2 }} spacing={6}>
        <AnimatePresence>
          {filtered.map((booking, index) => {
            const statusColor =
              booking.status === "CONFIRMED" || booking.status === "COMPLETED"
                ? "green.400"
                : booking.status === "CANCELLED"
                  ? "red.400"
                  : "orange.400";

            const statusBg =
              booking.status === "CONFIRMED" || booking.status === "COMPLETED"
                ? "green.50"
                : booking.status === "CANCELLED"
                  ? "red.50"
                  : "orange.50";

            const statusBadgeColor =
              booking.status === "CONFIRMED" || booking.status === "COMPLETED"
                ? "green"
                : booking.status === "CANCELLED"
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
                whileHover={{ y: -5 }}
              >
                <Card
                  direction={{ base: "column", sm: "row" }}
                  overflow="hidden"
                  variant="outline"
                  borderRadius="2xl"
                  border="1px solid"
                  borderColor="gray.200"
                  boxShadow="md"
                  bg="white"
                  h="full"
                  transition="all 0.3s ease"
                  _hover={{ boxShadow: "xl", borderColor: "green.200" }}
                  w="full"
                >
                  {/* Service Image Section */}
                  <Box
                    w={{ base: "100%", sm: "120px", md: "200px" }}
                    bg="gray.100"
                    position="relative"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                  >
                    {booking.service?.coverPhoto ? (
                      <Box
                        as="img"
                        src={booking.service.coverPhoto}
                        alt={booking.service.title}
                        objectFit="cover"
                        w="full"
                        h="full"
                        minH={{ base: "150px", sm: "auto" }}
                      />
                    ) : (
                      <Flex
                        direction="column"
                        align="center"
                        justify="center"
                        w="full"
                        h="full"
                        bg={statusBg}
                        color={statusColor}
                        p={4}
                        textAlign="center"
                      >
                        <Text
                          fontSize="xs"
                          fontWeight="bold"
                          letterSpacing="widest"
                          textTransform="uppercase"
                          mb={1}
                        >
                          {new Date(booking.date).toLocaleDateString(
                            undefined,
                            { month: "short" },
                          )}
                        </Text>
                        <Text fontSize="3xl" fontWeight="800" lineHeight="1">
                          {new Date(booking.date).getDate()}
                        </Text>
                        <Text
                          fontSize="xs"
                          fontWeight="medium"
                          mt={2}
                          opacity={0.8}
                        >
                          {booking.time}
                        </Text>
                      </Flex>
                    )}

                    {/* Status Badge Over Image on Mobile */}
                    <Box
                      position="absolute"
                      top={3}
                      left={3}
                      display={{ base: "block", sm: "none" }}
                    >
                      <Badge
                        colorScheme={statusBadgeColor}
                        variant="solid"
                        px={2}
                        py={1}
                        borderRadius="md"
                        fontSize="xs"
                        fontWeight="bold"
                        textTransform="uppercase"
                        boxShadow="md"
                      >
                        {booking.status}
                      </Badge>
                    </Box>
                  </Box>

                  <VStack align="stretch" p={0} flex={1} spacing={0}>
                    {/* Header with Status and Price */}
                    <Flex
                      justify="space-between"
                      align="center"
                      p={4}
                      pb={2}
                      borderBottom="1px solid"
                      borderColor="gray.50"
                    >
                      <Badge
                        display={{ base: "none", sm: "block" }}
                        colorScheme={statusBadgeColor}
                        variant="subtle"
                        px={2}
                        py={1}
                        borderRadius="md"
                        fontSize="xs"
                        fontWeight="bold"
                        textTransform="uppercase"
                      >
                        {booking.status}
                      </Badge>
                      <Spacer display={{ base: "none", sm: "block" }} />
                      <Text
                        fontSize="lg"
                        fontWeight="800"
                        color="green.600"
                        letterSpacing="tight"
                      >
                        AED {booking.service?.price}
                      </Text>
                    </Flex>

                    <CardBody p={4} py={3}>
                      {/* Service Title & Category */}
                      <VStack align="start" spacing={1} mb={4}>
                        <Text
                          fontSize="xs"
                          color="gray.500"
                          fontWeight="bold"
                          textTransform="uppercase"
                          letterSpacing="wider"
                        >
                          {booking.service?.category?.name || "Service"}
                        </Text>
                        <Heading
                          size="sm"
                          color="gray.800"
                          noOfLines={1}
                          fontWeight="700"
                        >
                          {booking.service?.title}
                        </Heading>
                      </VStack>

                      {/* Date & Time Grid */}
                      <SimpleGrid columns={2} spacing={4} mb={5}>
                        <HStack spacing={2} color="gray.600">
                          <Icon as={FiCalendar} boxSize={4} color="green.500" />
                          <Text fontSize="sm" fontWeight="600">
                            {new Date(booking.date).toLocaleDateString(
                              undefined,
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </Text>
                        </HStack>
                        <HStack spacing={2} color="gray.600">
                          <Icon as={FiClock} boxSize={4} color="green.500" />
                          <Text fontSize="sm" fontWeight="600">
                            {booking.time}
                          </Text>
                        </HStack>
                      </SimpleGrid>

                      {/* Seeker Info - Redesigned */}
                      <HStack
                        spacing={3}
                        p={3}
                        bg="gray.50"
                        borderRadius="xl"
                        border="1px dashed"
                        borderColor="gray.200"
                      >
                        <Avatar
                          size="sm"
                          name={booking.seeker?.name || "User"}
                          src={booking.seeker?.image}
                          border="2px solid white"
                          boxShadow="sm"
                        />
                        <Box flex={1}>
                          <Text
                            fontSize="sm"
                            fontWeight="bold"
                            color="gray.800"
                          >
                            {booking.seeker?.name ||
                              booking.seeker?.email ||
                              "Unknown Seeker"}
                          </Text>
                          {(booking.seeker?.mobile ||
                            booking.seeker?.email) && (
                            <Text fontSize="xs" color="gray.500" noOfLines={1}>
                              {booking.seeker?.mobile || booking.seeker?.email}
                            </Text>
                          )}
                        </Box>
                        <Button
                          size="sm"
                          leftIcon={<FiMessageSquare />}
                          colorScheme="blue"
                          variant="solid"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMessage(booking.seeker);
                          }}
                          fontSize="xs"
                          borderRadius="lg"
                          px={4}
                        >
                          Chat
                        </Button>
                      </HStack>
                    </CardBody>

                    {/* Footer Actions */}
                    <CardFooter
                      p={3}
                      bg="gray.50"
                      borderTop="1px solid"
                      borderColor="gray.100"
                    >
                      {booking.status === "PENDING" && (
                        <Flex gap={2} w="full">
                          <Button
                            flex={1}
                            size="sm"
                            colorScheme="green"
                            onClick={() =>
                              onUpdateStatus(booking.id, "CONFIRMED")
                            }
                            shadow="sm"
                          >
                            Accept
                          </Button>
                          <Button
                            flex={1}
                            size="sm"
                            variant="outline"
                            colorScheme="red"
                            onClick={() =>
                              onUpdateStatus(booking.id, "REJECTED")
                            }
                          >
                            Decline
                          </Button>
                        </Flex>
                      )}

                      {booking.status === "CONFIRMED" && (
                        <Flex gap={2} w="full">
                          <Button
                            flex={1}
                            size="sm"
                            colorScheme="blue"
                            leftIcon={<FiCheckCircle />}
                            onClick={() =>
                              onUpdateStatus(booking.id, "COMPLETED")
                            }
                            shadow="sm"
                          >
                            Complete
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => openCancelModal(booking)}
                          >
                            Cancel
                          </Button>
                        </Flex>
                      )}

                      {booking.status === "CANCELLED" &&
                        booking.cancellationReason && (
                          <Box
                            w="full"
                            p={2}
                            bg="red.50"
                            borderRadius="md"
                            border="1px dashed"
                            borderColor="red.200"
                          >
                            <Text fontSize="xs" color="red.700">
                              <Text as="span" fontWeight="bold">
                                Reason:{" "}
                              </Text>
                              {booking.cancellationReason}
                            </Text>
                          </Box>
                        )}

                      {(booking.status === "COMPLETED" ||
                        booking.status === "REJECTED" ||
                        (booking.status === "CANCELLED" &&
                          !booking.cancellationReason)) && (
                        <Text
                          fontSize="xs"
                          color="gray.400"
                          w="full"
                          textAlign="center"
                          fontStyle="italic"
                        >
                          No actions available
                        </Text>
                      )}
                    </CardFooter>
                  </VStack>
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

        {/* Search is provided by the Navbar SearchBox via SearchContext */}
      </Flex>

      {loading ? (
        <Flex justify="center" h="400px" align="center">
          <Spinner size="xl" color="green.500" thickness="4px" />
        </Flex>
      ) : (
        <Tabs
          variant="soft-rounded"
          colorScheme="green"
          isLazy
          index={tabIndex}
          onChange={(index) => setTabIndex(index)}
        >
          <TabList
            mb={6}
            overflowX="auto"
            overflowY="hidden"
            whiteSpace="nowrap"
            py={2}
            px={1}
            css={{
              "&::-webkit-scrollbar": { display: "none" },
              scrollbarWidth: "none",
              "-ms-overflow-style": "none",
            }}
          >
            <Tab
              fontWeight="bold"
              flexShrink={0}
              _selected={{ color: "white", bg: "green.500" }}
            >
              Pending ({bookings.filter((b) => b.status === "PENDING").length})
            </Tab>
            <Tab
              fontWeight="bold"
              flexShrink={0}
              _selected={{ color: "white", bg: "green.500" }}
            >
              Accepted (
              {bookings.filter((b) => b.status === "CONFIRMED").length})
            </Tab>
            <Tab
              fontWeight="bold"
              flexShrink={0}
              _selected={{ color: "white", bg: "green.500" }}
            >
              Past
            </Tab>
            <Tab
              fontWeight="bold"
              flexShrink={0}
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
      <CancelModal
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        booking={selectedBooking}
        onCancel={onUpdateStatus}
      />
    </Container>
  );
}
