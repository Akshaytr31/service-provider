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
  Divider,
} from "@chakra-ui/react";
import ServiceCard from "../components/seeker/ServiceCard";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MotionBox = motion(Box);
const MotionGrid = motion(Grid);

export default function SeekerDashboard() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch("/api/services");

        if (!res.ok) {
          throw new Error("Failed to fetch services");
        }

        const data = await res.json();
        setServices(data);
      } catch (error) {
        console.error("Failed to fetch services", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
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
              <Text>Trusted Provider Network</Text>
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
