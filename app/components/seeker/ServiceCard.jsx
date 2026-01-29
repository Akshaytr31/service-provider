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
  Divider,
  Image,
  Skeleton,
  AspectRatio,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { InfoIcon, EmailIcon } from "@chakra-ui/icons";

const MotionCard = motion(Card);

function ServiceCard({ service }) {
  if (!service) return null;

  const hasCoverPhoto = Boolean(service.coverPhoto);

  return (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition="0.3s ease"
      bg="white"
      borderRadius="xl"
      border="1px solid"
      borderColor="green.100"
      boxShadow="sm"
      overflow="hidden"
      h="100%"
    >
      {/* COVER PHOTO */}
      <AspectRatio ratio={16 / 9}>
        <Box position="relative" w="100%" h="100%">
          {hasCoverPhoto ? (
            <Image
              src={service.coverPhoto}
              alt={service.title}
              objectFit="cover"
              w="100%"
              h="100%"
              bg="green.50"
            />
          ) : (
            <Skeleton w="100%" h="100%" />
          )}

          {/* BADGE */}
          <Badge
            position="absolute"
            top={3}
            left={3}
            colorScheme="green"
            fontSize="2xs"
            px={3}
            py={1}
            borderRadius="lg"
          >
            Service
          </Badge>
        </Box>
      </AspectRatio>

      {/* CONTENT */}
      <CardBody p={6}>
        <Stack spacing={4}>
          {/* HEADER */}
          <Flex justify="space-between" align="flex-start">
            <Heading size="md" noOfLines={1} color="green.700">
              {service.title}
            </Heading>

            <Box textAlign="right">
              <Text fontSize="xl" fontWeight="bold" color="green.600">
                ₹{service.price}
              </Text>
              <Text fontSize="10px" color="green.400">
                Per Hour
              </Text>
            </Box>
          </Flex>

          {/* DESCRIPTION */}
          <Text fontSize="sm" color="gray.600" noOfLines={3}>
            {service.description}
          </Text>

          <Divider />

          {/* LOCATION */}
          <Flex align="center" gap={2}>
            <Icon as={InfoIcon} color="green.500" />
            <Text fontSize="xs" color="gray.600">
              {service.location}
            </Text>
          </Flex>

          {/* PROVIDER */}
          <Flex align="center" gap={2}>
            <Icon as={EmailIcon} color="green.500" />
            <Text fontSize="xs" color="gray.600" noOfLines={1}>
              {service.providerEmail}
            </Text>
          </Flex>

          {/* CTA */}
          <Button
            mt={3}
            w="full"
            bg="green.500"
            color="white"
            _hover={{ bg: "green.600" }}
            borderRadius="xl"
          >
            Contact Provider
          </Button>
        </Stack>
      </CardBody>
    </MotionCard>
  );
}

export default ServiceCard;
