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
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

export default function SeekerDashboard() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then(setServices);
  }, []);

  return (
    <Box maxW="900px" mx="auto" mt={10} marginTop={"80px"}>
      <Heading mb={6}>Available Services</Heading>
      <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={4} spacing={6}>
        {services.map((service) => (
          <Card
            key={service.id}
            borderWidth="1px"
            borderRadius="xl"
            boxShadow="sm"
            _hover={{ boxShadow: "md", transform: "translateY(-2px)" }}
            transition="all 0.2s"
          >
            <CardBody>
              <Stack spacing={3}>
                {/* Title + Price */}
                <Flex justify="space-between" align="center">
                  <Heading size="md" color="gray.800">
                    {service.title}
                  </Heading>

                  <Text fontWeight="bold" fontSize="lg" color="blue.600">
                    ₹ {service.price || "On request"}
                  </Text>
                </Flex>

                {/* Description */}
                <Text color="gray.600" noOfLines={3}>
                  {service.description}
                </Text>

                {/* Footer */}
                <Flex
                  justify="space-between"
                  align="center"
                  pt={2}
                  borderTop="1px solid"
                  borderColor="gray.100"
                >
                  <Text fontSize="sm" color="gray.500">
                    📍 {service.location || "Location not specified"}
                  </Text>

                  <Button size="sm" colorScheme="blue" variant="outline">
                    Contact Provider
                  </Button>
                </Flex>
              </Stack>
            </CardBody>
          </Card>
        ))}
      </Grid>
    </Box>
  );
}
