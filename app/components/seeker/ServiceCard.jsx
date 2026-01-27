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
  Badge,
  Icon,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { InfoIcon } from "@chakra-ui/icons";

const MotionCard = motion(Card);

function ServiceCard({ service }) {
  if (!service) return null;

  return (
    <MotionCard
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      whileHover={{ y: -10 }}
      bg="white"
      borderRadius="12px"
      border="1px solid"
      borderColor="#EDF2F7"
      boxShadow="0 4px 20px rgba(0,0,0,0.03)"
      transition="all 0.3s ease"
    >
      <CardBody p={8}>
        <Stack spacing={5} height={"full"} justify="space-between">
          {/* Header */}
          <Flex justify="space-between" align="start" >
            <Box>
              <Badge
                colorScheme="green"
                borderRadius="lg"
                px={3}
                py={1}
                mb={3}
                fontSize="2xs"
                fontWeight="bold"
                textTransform="uppercase"
              >
                {service.category || "Service"}
              </Badge>

              <Heading size="md" noOfLines={1}>
                {service.title}
              </Heading>
            </Box>

            <Box textAlign="right">
              <Text fontWeight="bold" fontSize="2xl" color="green.600">
                {service.price ? `₹${service.price}` : "POA"}
              </Text>
              <Text fontSize="10px" color="gray.400">
                INCL. TAXES
              </Text>
            </Box>
          </Flex>

          {/* Description */}
          <Text fontSize="sm" color="gray.500" noOfLines={3}>
            {service.description}
          </Text>

          {/* Location */}
          <Flex align="center" gap={3} bg="gray.50" p={2} borderRadius="xl">
            <Icon as={InfoIcon} color="green.500" />
            <Text fontSize="xs" color="gray.600">
              {service.location || "Available Nationwide"}
            </Text>
          </Flex>

          {/* CTA */}
          <Button
            w="full"
            bg="green.500"
            color="white"
            _hover={{ bg: "green.600" }}
            size="lg"
            borderRadius="2xl"
          >
            Contact Provider
          </Button>
        </Stack>
      </CardBody>
    </MotionCard>
  );
}

export default ServiceCard;
