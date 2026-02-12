"use client";

import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  Image,
  Button,
  Flex,
  Icon,
  Badge,
  Skeleton,
  Avatar,
  Divider,
  SimpleGrid,
  useToast,
  VStack,
  HStack,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChatBox from "@/app/components/ChatBox"; // Ensure this path is correct
import {
  FiMapPin,
  FiClock,
  FiStar,
  FiCheckCircle,
  FiShield,
  FiShare2,
  FiHeart,
  FiCalendar,
} from "react-icons/fi";

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

export default function ServiceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const {
    isOpen: isChatOpen,
    onOpen: onChatOpen,
    onClose: onChatClose,
  } = useDisclosure();

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await fetch(`/api/services/${params.id}`);
        if (!res.ok) throw new Error("Service not found");
        const data = await res.json();
        setService(data);
      } catch (error) {
        console.error("Error fetching service:", error);
        toast({
          title: "Error",
          description: "Could not load service details.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchService();
    }
  }, [params.id, toast]);

  if (loading) {
    return (
      <Container maxW="container.xl" py={10}>
        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={10}>
          <Box gridColumn={{ lg: "span 2" }}>
            <Skeleton height="400px" borderRadius="3xl" mb={8} />
            <Stack spacing={4}>
              <Skeleton height="40px" width="60%" />
              <Skeleton height="20px" width="40%" />
              <Skeleton height="20px" width="100%" />
              <Skeleton height="20px" width="100%" />
            </Stack>
          </Box>
          <Box>
            <Skeleton height="500px" borderRadius="3xl" />
          </Box>
        </SimpleGrid>
      </Container>
    );
  }

  if (!service) {
    return (
      <Container maxW="container.lg" py={20} centerContent>
        <VStack spacing={6}>
          <Heading color="gray.400" size="xl">
            Service not found
          </Heading>
          <Button
            size="lg"
            colorScheme="green"
            variant="outline"
            onClick={() => router.back()}
          >
            Go Back
          </Button>
        </VStack>
      </Container>
    );
  }

  const hasRating = service.rating && service.rating > 0;

  return (
    <Box minH="100vh" bg="#FAFAFA" pb={20}>
      {/* BACKGROUND DECORATION */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        h="600px"
        bgGradient="linear(to-b, green.50, transparent)"
        zIndex={0}
      />

      <Container
        maxW="container.xl"
        pt={{ base: 4, md: 8 }}
        position="relative"
        zIndex={1}
      >
        <SimpleGrid columns={{ base: 1, lg: 12 }} spacing={{ base: 8, lg: 12 }}>
          {/* LEFT COLUMN: VISUALS & CONTENT (span 8) */}
          <Box gridColumn={{ lg: "span 8" }}>
            {/* HERO IMAGE SECTION */}
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              position="relative"
              borderRadius="3xl"
              overflow="hidden"
              boxShadow="2xl"
              h={{ base: "300px", md: "500px" }}
              mb={10}
              mt={"70px"}
            >
              <Image
                src={
                  service.coverPhoto || "https://via.placeholder.com/1200x600"
                }
                alt={service.title}
                w="100%"
                h="100%"
                objectFit="cover"
                transition="transform 0.5s ease"
                _hover={{ transform: "scale(1.02)" }}
              />
              {/* Overlay Gradient */}
              <Box
                position="absolute"
                inset={0}
                bgGradient="linear(to-t, blackAlpha.700, transparent)"
              />

              {/* Top controls */}
              <Flex position="absolute" top={4} right={4} gap={3}>
                <Button
                  size="sm"
                  bg="whiteAlpha.900"
                  color="gray.700"
                  leftIcon={<Icon as={FiShare2} />}
                  borderRadius="full"
                  _hover={{ bg: "white" }}
                >
                  Share
                </Button>
                <Button
                  size="sm"
                  bg="whiteAlpha.900"
                  color="pink.500"
                  leftIcon={<Icon as={FiHeart} />}
                  borderRadius="full"
                  _hover={{ bg: "white" }}
                >
                  Save
                </Button>
              </Flex>

              {/* Bottom Info on Image */}
              <Box
                position="absolute"
                bottom={0}
                left={0}
                right={0}
                p={{ base: 6, md: 10 }}
              >
                <Badge
                  colorScheme="green"
                  bg="green.400"
                  color="white"
                  fontSize="sm"
                  px={3}
                  py={1}
                  borderRadius="full"
                  mb={4}
                  boxShadow="lg"
                >
                  Verified Service
                </Badge>
                <Heading
                  as="h1"
                  size="2xl"
                  color="white"
                  mb={3}
                  textShadow="0 2px 10px rgba(0,0,0,0.3)"
                  lineHeight="1.2"
                >
                  {service.title}
                </Heading>
                <HStack spacing={6} color="whiteAlpha.900">
                  <HStack>
                    <Icon as={FiMapPin} />
                    <Text fontWeight="medium">
                      {service.location || "Remote / On-site"}
                    </Text>
                  </HStack>
                  {hasRating && (
                    <HStack>
                      <Icon
                        as={FiStar}
                        color="yellow.400"
                        fill="currentColor"
                      />
                      <Text fontWeight="bold">{service.rating}</Text>
                      <Text opacity={0.8}>({service.reviewCount} reviews)</Text>
                    </HStack>
                  )}
                </HStack>
              </Box>
            </MotionBox>

            {/* DESCRIPTION & DETAILS */}
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Box
                bg="white"
                borderRadius="3xl"
                p={{ base: 6, md: 10 }}
                boxShadow="lg"
                mb={8}
              >
                <Heading size="lg" mb={6} color="gray.800">
                  About this Service
                </Heading>
                <Text
                  color="gray.600"
                  fontSize="lg"
                  lineHeight="1.8"
                  whiteSpace="pre-wrap"
                >
                  {service.description}
                </Text>
              </Box>

              {/* Provider Mini Profile */}
              <Box
                bg="white"
                borderRadius="3xl"
                p={{ base: 6, md: 8 }}
                boxShadow="lg"
                mb={8}
              >
                <Heading
                  size="md"
                  mb={6}
                  color="gray.500"
                  textTransform="uppercase"
                  letterSpacing="wider"
                  fontSize="sm"
                >
                  Service Provider
                </Heading>
                <Flex
                  direction={{ base: "column", md: "row" }}
                  align={{ base: "start", md: "center" }}
                  gap={6}
                >
                  <Avatar
                    size="2xl"
                    name={service.providerName}
                    src={service.providerAvatar}
                    border="4px solid"
                    borderColor="green.50"
                  />
                  <Box flex="1">
                    <Heading size="lg" mb={1}>
                      {service.providerName || "Service Provider"}
                    </Heading>
                    <Text color="gray.500" fontSize="md" mb={3}>
                      Professional Service Provider
                    </Text>
                    <HStack spacing={4}>
                      <Badge
                        colorScheme="green"
                        variant="subtle"
                        px={2}
                        borderRadius="md"
                      >
                        <Icon as={FiShield} mr={1} mb="2px" /> Identity Verified
                      </Badge>
                      <Badge
                        colorScheme="blue"
                        variant="subtle"
                        px={2}
                        borderRadius="md"
                      >
                        <Icon as={FiStar} mr={1} mb="2px" /> Top Rated
                      </Badge>
                    </HStack>
                  </Box>
                  <Button
                    size="lg"
                    variant="ghost"
                    colorScheme="green"
                    onClick={() => {
                      if (service.providerUserId) {
                        router.push(`/profile/${service.providerUserId}`);
                      }
                    }}
                  >
                    View Profile
                  </Button>
                  <Button
                    size="lg"
                    variant="solid"
                    colorScheme="green"
                    ml={2}
                    leftIcon={
                      <Icon as={require("react-icons/fi").FiMessageSquare} />
                    }
                    onClick={onChatOpen}
                  >
                    Chat
                  </Button>
                </Flex>
              </Box>

              {/* REVIEWS PLACEHOLDER */}
              <Box
                bg="white"
                borderRadius="3xl"
                p={{ base: 6, md: 10 }}
                boxShadow="lg"
              >
                <HStack justify="space-between" mb={8}>
                  <Heading size="lg" color="gray.800">
                    Reviews
                  </Heading>
                  {hasRating && (
                    <HStack>
                      <Icon
                        as={FiStar}
                        color="green.500"
                        boxSize={6}
                        fill="currentColor"
                      />
                      <Heading size="lg" color="green.600">
                        {service.rating}
                      </Heading>
                    </HStack>
                  )}
                </HStack>
                {hasRating ? (
                  <Text color="gray.500">
                    Reviews content will be implemented here.
                  </Text>
                ) : (
                  <Flex
                    direction="column"
                    align="center"
                    py={8}
                    textAlign="center"
                  >
                    <Box bg="gray.50" p={4} borderRadius="full" mb={4}>
                      <Icon as={FiStar} boxSize={8} color="gray.300" />
                    </Box>
                    <Text fontSize="lg" fontWeight="medium" color="gray.600">
                      No reviews yet
                    </Text>
                    <Text color="gray.400">
                      Be the first to experience this premium service.
                    </Text>
                  </Flex>
                )}
              </Box>
            </MotionBox>
          </Box>

          {/* RIGHT COLUMN: STICKY BOOKING CARD (span 4) */}
          <Box gridColumn={{ lg: "span 4" }}>
            <Box position="sticky" top="100px">
              <MotionBox
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                bg="white"
                borderRadius="3xl"
                p={8}
                boxShadow="2xl"
                border="1px solid"
                borderColor="green.100"
              >
                <Flex justify="space-between" align="baseline" mb={2}>
                  <Text fontSize="3xl" fontWeight="900" color="gray.800">
                    ₹{service.price}
                  </Text>
                  <Text color="gray.500" fontWeight="medium">
                    per hour
                  </Text>
                </Flex>

                <HStack mb={8} spacing={1}>
                  <Icon as={FiStar} color="green.400" fill="currentColor" />
                  <Text fontWeight="bold" fontSize="sm">
                    {service.rating || "New"}
                  </Text>
                  {service.reviewCount && (
                    <Text fontSize="sm" color="gray.400">
                      ({service.reviewCount})
                    </Text>
                  )}
                </HStack>

                <Stack spacing={4} mb={8}>
                  <Box
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="xl"
                    p={4}
                  >
                    <Flex align="center" gap={3} mb={2}>
                      <Icon as={FiCalendar} color="green.500" />
                      <Text fontWeight="bold" fontSize="sm">
                        Availability
                      </Text>
                    </Flex>
                    <Text fontSize="xs" color="gray.500">
                      Contact provider for schedule
                    </Text>
                  </Box>
                  <Box
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="xl"
                    p={4}
                  >
                    <Flex align="center" gap={3} mb={2}>
                      <Icon as={FiCheckCircle} color="green.500" />
                      <Text fontWeight="bold" fontSize="sm">
                        Guaranteed
                      </Text>
                    </Flex>
                    <Text fontSize="xs" color="gray.500">
                      Protected by Service Guarantee
                    </Text>
                  </Box>
                </Stack>

                <Button
                  w="full"
                  size="lg"
                  h="64px"
                  bgGradient="linear(to-r, green.400, green.600)"
                  color="white"
                  fontSize="xl"
                  fontWeight="bold"
                  borderRadius="2xl"
                  boxShadow="xl"
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "2xl",
                    bgGradient: "linear(to-r, green.500, green.700)",
                  }}
                  transition="all 0.3s"
                  onClick={() => {
                    router.push(`/seeker/service/${params.id}/book`);
                  }}
                >
                  Book Service
                </Button>

                <Text fontSize="xs" color="gray.400" mt={6} textAlign="center">
                  You won't be charged yet
                </Text>
              </MotionBox>
            </Box>
          </Box>
        </SimpleGrid>
      </Container>

      {service && (
        <ChatBox
          isOpen={isChatOpen}
          onClose={onChatClose}
          otherUserId={service.providerUserId}
          otherUserName={service.providerName}
          otherUserAvatar={service.providerAvatar}
        />
      )}
    </Box>
  );
}
