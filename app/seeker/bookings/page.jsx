"use client";

import {
  Box,
  Heading,
  Text,
  Container,
  VStack,
  HStack,
  Badge,
  Button,
  useColorModeValue,
  Spinner,
  Flex,
  Icon,
  Tag,
  Avatar,
  Tab,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiStar,
  FiCheckCircle,
} from "react-icons/fi";
import { useSession } from "next-auth/react";
import ReviewModal from "../../components/ReviewModal";

export default function SeekerBookings() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings?role=seeker"); // Ensure this endpoint returns user's bookings
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
    if (session) {
      fetchBookings();
    }
  }, [session]);

  const handleOpenReview = (booking) => {
    setSelectedBooking(booking);
    onOpen();
  };

  // Filter Bookings
  const activeBookings = bookings.filter(
    (b) => b.status === "PENDING" || b.status === "CONFIRMED",
  );
  const pastBookings = bookings.filter(
    (b) =>
      b.status === "COMPLETED" ||
      b.status === "REJECTED" ||
      b.status === "CANCELLED",
  );

  const BookingCard = ({ booking }) => {
    const isCompleted = booking.status === "COMPLETED";
    // Check if review exists (we need to ensure API returns this, likely need to update GET /api/bookings to include review)
    // For now assuming we can check based on some field or just let them try and see error if duplicate
    // Ideally we update GET /api/bookings to include `review: true` or similar.

    // Determine status color
    const statusColor =
      {
        PENDING: "orange",
        CONFIRMED: "blue",
        COMPLETED: "green",
        REJECTED: "red",
        CANCELLED: "gray",
      }[booking.status] || "gray";

    return (
      <Box
        p={6}
        bg="white"
        borderRadius="xl"
        border="1px solid"
        borderColor="gray.100"
        shadow="sm"
        _hover={{ shadow: "md" }}
        transition="all 0.2s"
      >
        <Flex justify="space-between" align="start" mb={4}>
          <HStack spacing={4}>
            <Avatar
              src={booking.provider?.image}
              name={booking.provider?.name}
              size="md"
            />
            <VStack align="start" spacing={0}>
              <Heading size="sm" color="gray.800">
                {booking.service?.title}
              </Heading>
              <Text fontSize="sm" color="gray.500">
                Provider: {booking.provider?.name}
              </Text>
            </VStack>
          </HStack>
          <Badge colorScheme={statusColor} px={3} py={1} borderRadius="full">
            {booking.status}
          </Badge>
        </Flex>

        <HStack spacing={6} mb={6}>
          <HStack color="gray.600">
            <Icon as={FiCalendar} />
            <Text fontSize="sm">
              {new Date(booking.date).toLocaleDateString()}
            </Text>
          </HStack>
          <HStack color="gray.600">
            <Icon as={FiClock} />
            <Text fontSize="sm">{booking.time}</Text>
          </HStack>
          <HStack color="gray.600">
            <Text fontWeight="bold" color="green.600">
              {booking.service?.price}
            </Text>
          </HStack>
        </HStack>

        <Flex justify="flex-end">
          {isCompleted && !booking.review && (
            <Button
              leftIcon={<FiStar />}
              colorScheme="yellow"
              variant="outline"
              size="sm"
              onClick={() => handleOpenReview(booking)}
            >
              Leave a Review
            </Button>
          )}
          {booking.status === "CONFIRMED" && (
            <Button
              leftIcon={<FiCheckCircle />}
              colorScheme="blue"
              size="sm"
              onClick={() =>
                handleOpenReview({ ...booking, isCompleting: true })
              }
            >
              Complete Service
            </Button>
          )}
          {booking.review && (
            <HStack spacing={1}>
              <Text fontSize="sm" color="gray.500" mr={2}>
                You Rated:
              </Text>
              {[...Array(5)].map((_, i) => (
                <Icon
                  key={i}
                  as={FiStar}
                  color={i < booking.review.rating ? "yellow.400" : "gray.300"}
                  fill={i < booking.review.rating ? "currentColor" : "none"}
                />
              ))}
            </HStack>
          )}
        </Flex>
      </Box>
    );
  };

  if (loading) {
    return (
      <Flex h="50vh" justify="center" align="center">
        <Spinner size="xl" color="green.500" />
      </Flex>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50" py={12} marginTop={"70px"}>
      <Container maxW="container.xl">
        <Heading mb={8} color="gray.800">
          My Bookings
        </Heading>

        <Tabs colorScheme="green" variant="soft-rounded">
          <TabList mb={6}>
            <Tab borderRadius="full" mr={4}>
              Active Bookings
            </Tab>
            <Tab borderRadius="full">History</Tab>
          </TabList>

          <TabPanels>
            <TabPanel px={0}>
              <VStack spacing={4} align="stretch">
                {activeBookings.length > 0 ? (
                  activeBookings.map((b) => (
                    <BookingCard key={b.id} booking={b} />
                  ))
                ) : (
                  <Text color="gray.500" textAlign="center" py={10}>
                    No active bookings found.
                  </Text>
                )}
              </VStack>
            </TabPanel>
            <TabPanel px={0}>
              <VStack spacing={4} align="stretch">
                {pastBookings.length > 0 ? (
                  pastBookings.map((b) => (
                    <BookingCard key={b.id} booking={b} />
                  ))
                ) : (
                  <Text color="gray.500" textAlign="center" py={10}>
                    No past bookings found.
                  </Text>
                )}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>

      <ReviewModal
        isOpen={isOpen}
        onClose={onClose}
        booking={selectedBooking}
        onReviewSubmitted={fetchBookings}
      />
    </Box>
  );
}
