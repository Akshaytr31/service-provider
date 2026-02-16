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
  Card,
  CardBody,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FiArrowLeft, FiBriefcase } from "react-icons/fi";

export default function ApprovedServices({ onBack }) {
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
