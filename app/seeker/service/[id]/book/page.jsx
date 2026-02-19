"use client";

import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  useToast,
  SimpleGrid,
  Icon,
  Input,
  Flex,
  Spinner,
  Badge,
  Grid,
  GridItem,
  Divider,
  Card,
  CardBody,
  Stack,
  useColorModeValue,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  FiCalendar,
  FiClock,
  FiArrowLeft,
  FiCheck,
  FiMapPin,
  FiUser,
  FiShield,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

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

const MotionBox = motion(Box);
const MotionButton = motion(Button);

const formatTo12Hour = (time24) => {
  if (!time24) return "";
  const [hours, minutes] = time24.split(":");
  let h = parseInt(hours, 10);
  const suffix = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h} ${suffix}`;
};

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
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
    setSelectedTime("");
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
        router.push("/seakerDashboard");
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
      <Flex justify="center" align="center" h="100vh" bg={bgColor}>
        <Spinner size="xl" color="green.500" thickness="4px" />
      </Flex>
    );

  if (!service)
    return (
      <Container py={10}>
        <Text>Service not found</Text>
      </Container>
    );

  const today = new Date().toISOString().split("T")[0];

  return (
    <Box minH="100vh" bg={bgColor} py={{ base: 6, md: 10 }} mt={"64px"}>
      <Container maxW="container.xl">
        {/* Header Section */}
        <Flex
          justify="space-between"
          align="center"
          mb={8}
          direction={{ base: "column", md: "row" }}
          gap={4}
        >
          <HStack spacing={4} w="full">
            <Button
              variant="outline"
              leftIcon={<FiArrowLeft />}
              onClick={() => router.back()}
              className="group"
              _hover={{
                bg: "white",
                shadow: "sm",
                borderColor: "green.500",
                color: "green.600",
              }}
              bg={cardBg}
              rounded="full"
              size="sm"
            >
              Back
            </Button>
            <VStack align="start" spacing={0}>
              <Heading size="md" color="gray.800">
                Complete Your Booking
              </Heading>
              <Text fontSize="sm" color="gray.500">
                Few steps away from your service
              </Text>
            </VStack>
          </HStack>
        </Flex>

        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8}>
          {/* LEFT COLUMN: Selection Area */}
          <GridItem as={VStack} spacing={6} align="stretch">
            {/* 1. Date Selection Card */}
            <MotionBox
              bg={cardBg}
              p={6}
              borderRadius="2xl"
              boxShadow="sm"
              border="1px solid"
              borderColor="gray.100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <HStack mb={6}>
                <Box p={2} bg="blue.50" rounded="lg">
                  <Icon as={FiCalendar} color="blue.500" boxSize={5} />
                </Box>
                <Heading size="md">Select Date</Heading>
              </HStack>

              <FormControl>
                <FormLabel color="gray.600" fontSize="sm">
                  Pick a preferred date
                </FormLabel>
                <Input
                  type="date"
                  min={today}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  size="lg"
                  bg="gray.50"
                  border="2px solid"
                  borderColor="gray.100"
                  _focus={{
                    borderColor: "green.400",
                    bg: "white",
                    shadow: "md",
                  }}
                  _hover={{ borderColor: "green.200" }}
                  borderRadius="xl"
                  fontWeight="medium"
                  color="gray.700"
                  py={6} // Taller input
                />
              </FormControl>
            </MotionBox>

            {/* 2. Time Selection Card */}
            <MotionBox
              bg={cardBg}
              p={6}
              borderRadius="2xl"
              boxShadow="sm"
              border="1px solid"
              borderColor="gray.100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <HStack mb={6}>
                <Box p={2} bg="orange.50" rounded="lg">
                  <Icon as={FiClock} color="orange.500" boxSize={5} />
                </Box>
                <Heading size="md">Select Time Slot</Heading>
              </HStack>

              <SimpleGrid
                columns={{ base: 2, sm: 3, md: 4, xl: 5 }}
                spacing={3}
              >
                {TIME_SLOTS.map((time) => {
                  const isBooked = bookedSlots.includes(time);
                  const isSelected = selectedTime === time;

                  return (
                    <MotionButton
                      key={time}
                      onClick={() => !isBooked && setSelectedTime(time)}
                      isDisabled={isBooked}
                      variant="outline"
                      h="50px"
                      borderRadius="xl"
                      position="relative"
                      overflow="hidden"
                      whileHover={!isBooked ? { scale: 1.05 } : {}}
                      whileTap={!isBooked ? { scale: 0.95 } : {}}
                      bg={
                        isSelected
                          ? "green.500"
                          : isBooked
                            ? "gray.50"
                            : "white"
                      }
                      borderColor={isSelected ? "green.500" : "gray.200"}
                      color={
                        isSelected
                          ? "white"
                          : isBooked
                            ? "gray.400"
                            : "gray.700"
                      }
                      _hover={
                        !isBooked
                          ? {
                              borderColor: "green.400",
                              color: isSelected ? "white" : "green.600",
                              bg: isSelected ? "green.600" : "white",
                            }
                          : {}
                      }
                      opacity={isBooked ? 0.6 : 1}
                      boxShadow={isSelected ? "lg" : "none"}
                    >
                      <Text fontWeight={isSelected ? "bold" : "medium"}>
                        {formatTo12Hour(time)}
                      </Text>
                      {isSelected && (
                        <Icon
                          as={FiCheck}
                          position="absolute"
                          right={2}
                          top={2}
                          fontSize="xs"
                        />
                      )}
                      {isBooked && (
                        <Box
                          position="absolute"
                          w="full"
                          h="1px"
                          bg="gray.400"
                          transform="rotate(-15deg)"
                        />
                      )}
                    </MotionButton>
                  );
                })}
              </SimpleGrid>
              {bookedSlots.length > 0 && (
                <Text mt={4} fontSize="xs" color="gray.500" textAlign="right">
                  * Grayed out slots are unavailable
                </Text>
              )}
            </MotionBox>
          </GridItem>

          {/* RIGHT COLUMN: Order Summary (Sticky) */}
          <GridItem>
            <Box position={{ lg: "sticky" }} top="100px">
              <MotionBox
                bg={cardBg}
                borderRadius="2xl"
                boxShadow="lg"
                border="1px solid"
                borderColor="gray.100"
                overflow="hidden"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Box bg="green.600" p={4} position="relative" overflow="hidden">
                  {/* Decorative Circle */}
                  <Box
                    position="absolute"
                    right="-20px"
                    top="-20px"
                    boxSize="100px"
                    rounded="full"
                    bg="whiteAlpha.200"
                  />

                  <Text
                    color="whiteAlpha.800"
                    fontSize="xs"
                    fontWeight="bold"
                    textTransform="uppercase"
                    letterSpacing="wider"
                  >
                    Booking Summary
                  </Text>
                  <Heading size="md" color="white" mt={1}>
                    {service.title}
                  </Heading>
                </Box>

                <VStack spacing={5} p={6} align="stretch">
                  {/* Provider Info */}
                  <HStack align="start" spacing={3}>
                    <Box p={2} bg="gray.50" rounded="full">
                      <Icon as={FiUser} color="gray.500" />
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.500">
                        Service Provider
                      </Text>
                      <Text fontWeight="bold" color="gray.800">
                        {service.providerName}
                      </Text>
                    </Box>
                  </HStack>

                  <Divider />

                  {/* Selected Slot Info */}
                  <VStack
                    align="stretch"
                    spacing={3}
                    bg="gray.50"
                    p={4}
                    rounded="xl"
                  >
                    <HStack justify="space-between">
                      <HStack color="gray.600">
                        <Icon as={FiCalendar} fontSize="sm" />
                        <Text fontSize="sm">Date</Text>
                      </HStack>
                      <Text fontWeight="medium" fontSize="sm">
                        {selectedDate || "Not chosen"}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <HStack color="gray.600">
                        <Icon as={FiClock} fontSize="sm" />
                        <Text fontSize="sm">Time</Text>
                      </HStack>
                      <Text fontWeight="medium" fontSize="sm">
                        {selectedTime
                          ? formatTo12Hour(selectedTime)
                          : "Not chosen"}
                      </Text>
                    </HStack>
                  </VStack>

                  <Divider />

                  {/* Price */}
                  <HStack justify="space-between" align="center">
                    <Text fontSize="lg" color="gray.600">
                      Total Price
                    </Text>
                    <Heading size="lg" color="green.600">
                      AED {service.price}
                    </Heading>
                  </HStack>

                  {/* Trust Badge */}
                  <HStack justify="center" bg="green.50" py={2} rounded="lg">
                    <Icon as={FiShield} color="green.500" />
                    <Text fontSize="xs" color="green.700" fontWeight="medium">
                      Secure & Verified Booking
                    </Text>
                  </HStack>

                  <Button
                    size="lg"
                    colorScheme="green"
                    onClick={handleBook}
                    isLoading={submitting}
                    isDisabled={!selectedDate || !selectedTime}
                    w="full"
                    h="56px"
                    fontSize="lg"
                    boxShadow="lg"
                    _hover={{ transform: "translateY(-2px)", boxShadow: "xl" }}
                    _active={{ transform: "scale(0.98)" }}
                    rounded="xl"
                  >
                    Confirm Booking
                  </Button>
                </VStack>
              </MotionBox>
            </Box>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
}
