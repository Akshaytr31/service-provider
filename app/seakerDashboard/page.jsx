"use client";

import {
  Box,
  Heading,
  Text,
  Stack,
  Card,
  CardBody,
  Flex,
  Button,
  Grid,
  Container,
  Icon,
  Badge,
  Skeleton,
  Divider
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { InfoIcon, TimeIcon, StarIcon } from "@chakra-ui/icons";

const MotionBox = motion(Box);
const MotionGrid = motion(Grid);
const MotionCard = motion(Card);

export default function SeekerDashboard() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => {
        setServices(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch services", err);
        setLoading(false);
      });
  }, []);

  return (
    <Box
      minH="100vh"
      bg="white"
      pt="100px"
      pb={20}
      position="relative"
      overflow="hidden"
    >
      {/* Decorative background elements */}
      <Box
        position="absolute"
        top="-10%"
        right="-5%"
        w="40%"
        h="40%"
        bgGradient="radial(green.100, transparent)"
        filter="blur(80px)"
        zIndex={0}
      />
      <Box
        position="absolute"
        bottom="10%"
        left="-5%"
        w="30%"
        h="30%"
        bgGradient="radial(green.100, transparent)"
        filter="blur(60px)"
        zIndex={0}
      />

      <Container maxW="container.xl" position="relative" zIndex={1}>
        {/* Hero Section */}
        <MotionBox
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          mb={12}
          textAlign="center"
        >
              <Badge
                colorScheme="green"
                variant="subtle"
                borderRadius="full"
                px={4}
                py={1}
                mb={6}
                fontSize="xs"
                fontWeight="bold"
                letterSpacing="wider"
                textTransform="uppercase"
                bg="green.50"
                color="green.600"
                border="1px solid"
                borderColor="green.100"
              >
                <Flex justifyContent="center" alignItems="center" gap={2}>

                <Text>
                  Trusted Provider Network
                </Text>
                <Divider orientation="vertical" h="24px" borderColor="gray.200" />
                <Text>Verified Professionals</Text>
                <Divider orientation="vertical" h="24px" borderColor="gray.200" />
                <Text>Transparent Pricing</Text>
                <Divider orientation="vertical" h="24px" borderColor="gray.200" />
                <Text>Quality Guaranteed</Text>
                </Flex>
              </Badge>
          <Box maxW="800px" mx="auto" position="relative" mb={14}>
            <Text
              color="gray.600"
              fontSize="xl"
              fontWeight="medium"
              lineHeight="tall"
              letterSpacing="tight"
            >
              Find the perfect professional for your needs. Trusted experts,
              transparent pricing, and quality guaranteed.
            </Text>
            <Box
              position="absolute"
              bottom="-24px"
              left="50%"
              transform="translateX(-50%)"
              w="140px"
              h="4px"
              bg="green.500"
              borderRadius="full"
            />
          </Box>


          <Heading
            as="h1"
            size="4xl"
            color="green.800"
            mb={8}
            fontWeight="black"
            letterSpacing="tight"
          >
            Discover Expert Services
          </Heading>
        </MotionBox>

        {/* Services Grid */}
        <AnimatePresence>
          {loading ? (
            <Grid
              templateColumns="repeat(auto-fill, minmax(320px, 1fr))"
              gap={8}
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton
                  key={i}
                  height="340px"
                  borderRadius="3xl"
                  startColor="gray.50"
                  endColor="gray.100"
                />
              ))}
            </Grid>
          ) : (
            <MotionGrid
              templateColumns="repeat(auto-fill, minmax(320px, 1fr))"
              gap={8}
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
            >
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </MotionGrid>
          )}
        </AnimatePresence>

        {!loading && services.length === 0 && (
          <Box textAlign="center" py={20}>
            <Text color="gray.400" fontSize="xl">
              No services currently available.
            </Text>
          </Box>
        )}
      </Container>
    </Box>
  );
}

function ServiceCard({ service }) {
  return (
    <MotionCard
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      whileHover={{ y: -10, transition: { duration: 0.3 } }}
      bg="white"
      borderRadius="3xl"
      border="1px solid"
      borderColor="gray.100"
      overflow="hidden"
      boxShadow="0 4px 20px rgba(0,0,0,0.03)"
      _hover={{
        borderColor: "green.300",
        boxShadow: "0 20px 40px rgba(72, 187, 120, 0.1)",
      }}
      transition="all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
    >
      <CardBody p={8}>
        <Stack spacing={5}>
          <Flex justify="space-between" align="start">
            <Box>
              <Badge
                colorScheme="green"
                variant="solid"
                bg="green.500"
                color="white"
                borderRadius="lg"
                px={3}
                py={1}
                mb={3}
                fontSize="2xs"
                fontWeight="bold"
                letterSpacing="tighter"
                textTransform="uppercase"
              >
                {service.category || "Service"}
              </Badge>
              <Heading
                size="md"
                color="gray.800"
                fontWeight="bold"
                noOfLines={1}
                letterSpacing="tight"
              >
                {service.title}
              </Heading>
            </Box>
            <Box textAlign="right">
              <Text fontWeight="black" fontSize="2xl" color="green.600">
                {service.price ? `₹${service.price}` : "POA"}
              </Text>
              <Text fontSize="10px" color="gray.400" fontWeight="bold">
                INCL. TAXES
              </Text>
            </Box>
          </Flex>

          <Text
            color="gray.500"
            fontSize="sm"
            noOfLines={3}
            h="60px"
            lineHeight="1.6"
          >
            {service.description}
          </Text>

          <Stack spacing={3} pt={2}>
            <Flex align="center" gap={3} bg="gray.50" p={2} borderRadius="xl">
              <Icon as={InfoIcon} color="green.500" w={4} h={4} />
              <Text
                fontSize="xs"
                color="gray.600"
                fontWeight="medium"
                noOfLines={1}
              >
                {service.location || "Available Nationwide"}
              </Text>
            </Flex>
          </Stack>

          <Button
            w="full"
            bg="green.500"
            color="white"
            _hover={{
              bg: "green.600",
              transform: "scale(1.02)",
              boxShadow: "0 10px 20px rgba(72, 187, 120, 0.3)",
            }}
            _active={{
              transform: "scale(0.98)",
            }}
            transition="all 0.2s"
            size="lg"
            borderRadius="2xl"
            fontWeight="extrabold"
            letterSpacing="tight"
          >
            Contact Provider
          </Button>
        </Stack>
      </CardBody>
    </MotionCard>
  );
}
