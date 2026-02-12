"use client";

import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  useToast, // Chakra UI toast
  SimpleGrid,
  Icon,
  Input, // For date
  Flex,
  Spinner,
  Badge,
} from "@chakra-ui/react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FiCalendar, FiClock, FiCheck, FiArrowLeft } from "react-icons/fi";

const TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch Service Details
  useEffect(() => {
    async function fetchService() {
      try {
        const res = await fetch(`/api/services/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setService(data);
        } else {
          toast({ title: "Service not found", status: "error" });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    if (params.id) fetchService();
  }, [params.id, toast]);

  // Fetch Availability when Date changes
  useEffect(() => {
    if (!selectedDate || !params.id) return;

    async function fetchAvailability() {
      try {
        const res = await fetch(
          `/api/services/${params.id}/availability?date=${selectedDate}`,
        );
        if (res.ok) {
          const slots = await res.json();
          setBookedSlots(slots);
        }
      } catch (error) {
        console.error(error);
      }
    }
    fetchAvailability();
    setSelectedTime(""); // Reset time on date change
  }, [selectedDate, params.id]);

  const handleBook = async () => {
    if (!selectedDate || !selectedTime) {
      toast({ title: "Please select date and time", status: "warning" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: params.id,
          date: selectedDate,
          time: selectedTime,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: "Booking Request Sent",
          description: "The provider will be notified.",
          status: "success",
          duration: 5000,
        });
        router.push("/seakerDashboard"); // Or wherever appropriate
      } else {
        toast({
          title: "Booking Failed",
          description: data.error,
          status: "error",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        status: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  if (!service)
    return (
      <Container py={10}>
        <Text>Service not found</Text>
      </Container>
    );

  // Get today's date string for min date
  const today = new Date().toISOString().split("T")[0];

  return (
    <Box minH="100vh" bg="gray.50" py={12} marginTop={"70px"}>
      <Container maxW="container.md">
        <Button
          mb={6}
          variant="ghost"
          leftIcon={<FiArrowLeft />}
          onClick={() => router.back()}
        >
          Back to Service
        </Button>

        <VStack spacing={8} align="stretch">
          <Heading size="lg" textAlign="center">
            Book Service
          </Heading>

          {/* Service Summary Card */}
          <Box
            bg="white"
            p={6}
            borderRadius="xl"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.100"
          >
            <Heading size="md" mb={2}>
              {service.title}
            </Heading>
            <Text color="gray.500" mb={4}>
              Provided by {service.providerName}
            </Text>
            <HStack>
              <Badge
                colorScheme="green"
                fontSize="lg"
                px={3}
                py={1}
                borderRadius="md"
              >
                ₹{service.price}
              </Badge>
            </HStack>
          </Box>

          {/* Date Selection */}
          <Box bg="white" p={6} borderRadius="xl" boxShadow="sm">
            <Heading
              size="sm"
              mb={4}
              display="flex"
              alignItems="center"
              gap={2}
            >
              <Icon as={FiCalendar} color="blue.500" /> Select Date
            </Heading>
            <Input
              type="date"
              min={today}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              size="lg"
            />
          </Box>

          {/* Time Selection */}
          {selectedDate && (
            <Box bg="white" p={6} borderRadius="xl" boxShadow="sm">
              <Heading
                size="sm"
                mb={4}
                display="flex"
                alignItems="center"
                gap={2}
              >
                <Icon as={FiClock} color="orange.500" /> Select Time Slot
              </Heading>

              <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} spacing={4}>
                {TIME_SLOTS.map((time) => {
                  const isBooked = bookedSlots.includes(time);
                  const isSelected = selectedTime === time;

                  return (
                    <Button
                      key={time}
                      onClick={() => !isBooked && setSelectedTime(time)}
                      isDisabled={isBooked}
                      colorScheme={isSelected ? "green" : "gray"}
                      variant={isSelected ? "solid" : "outline"}
                      h="50px"
                    >
                      {time}
                      {isBooked && (
                        <Text fontSize="xs" ml={2} color="red.500">
                          (Full)
                        </Text>
                      )}
                    </Button>
                  );
                })}
              </SimpleGrid>
            </Box>
          )}

          {/* Confirm Button */}
          <Button
            size="lg"
            colorScheme="green"
            onClick={handleBook}
            isLoading={submitting}
            isDisabled={!selectedDate || !selectedTime}
            h="60px"
            fontSize="xl"
            boxShadow="lg"
            _hover={{ transform: "translateY(-2px)", boxShadow: "xl" }}
          >
            Confirm Booking
          </Button>
        </VStack>
      </Container>
    </Box>
  );
}
