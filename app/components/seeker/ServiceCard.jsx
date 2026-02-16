"use client";

import {
  Box,
  Text,
  Stack,
  Card,
  Image,
  Skeleton,
  Button,
  Flex,
  Badge,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { StarIcon } from "@chakra-ui/icons";
import { useRouter } from "next/navigation";

const MotionCard = motion(Card);

function ServiceCard({ service }) {
  if (!service) return null;

  const router = useRouter();

  const hasCoverPhoto = Boolean(service.coverPhoto);
  const hasProvider = Boolean(service.providerName);
  const hasRating = service.rating && service.rating > 0;

  const handleCardClick = () => {
    router.push(`/seeker/service/${service.id}`);
  };

  return (
    <MotionCard
      role="group"
      borderRadius="lg"
      overflow="hidden"
      bg="white"
      cursor="pointer"
      transition="0.25s"
      _hover={{ boxShadow: "xl" }}
      onClick={handleCardClick}
    >
      {/* IMAGE */}
      <Box position="relative">
        {hasCoverPhoto ? (
          <Image
            src={service.coverPhoto}
            alt={service.title}
            w="100%"
            h="260px"
            objectFit="cover"
          />
        ) : (
          <Skeleton w="100%" h="260px" />
        )}

        {/* RATING BADGE */}
        {/* RATING OR NEW BADGE */}
        <Flex
          position="absolute"
          top={2}
          left={2}
          bg="whiteAlpha.500"
          px={2}
          py={1}
          borderRadius="md"
          align="center"
          gap={1}
          fontSize="xs"
          fontWeight="semibold"
          boxShadow="sm"
        >
          {hasRating ? (
            <>
              <Text color="gray.700">{Number(service.rating).toFixed(1)}</Text>
              <Flex gap="1px">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    color={
                      i < Math.round(service.rating) ? "yellow.300" : "gray.300"
                    }
                    boxSize={3}
                  />
                ))}
              </Flex>
              {service.reviewCount && (
                <Text color="gray.500">({service.reviewCount})</Text>
              )}
            </>
          ) : (
            <Text color="green.600">New</Text>
          )}
        </Flex>

        {/* HOVER ACTION */}
        <Flex
          position="absolute"
          bottom="0"
          left="0"
          right="0"
          bg="white"
          p={3}
          opacity={0}
          transform="translateY(100%)"
          transition="0.25s"
          _groupHover={{
            opacity: 1,
            transform: "translateY(0%)",
          }}
        >
          <Button
            w="full"
            size="sm"
            colorScheme="green"
            borderRadius="md"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
          >
            Book Service
          </Button>
        </Flex>
      </Box>

      {/* DETAILS */}
      <Stack spacing={1} p={3}>
        {/* Provider (only if exists) */}
        {hasProvider && (
          <Text fontSize="sm" fontWeight="bold">
            {service.providerName}
          </Text>
        )}

        {/* Title */}
        <Text fontSize="sm" fontWeight="bold" color="gray.600" noOfLines={1}>
          {service.title}
        </Text>

        {/* Price */}
        <Flex align="center" gap={2} mt={1}>
          <Text fontWeight="bold" fontSize="md">
            AED {service.price}
          </Text>

          <Text fontSize="xs" color="gray.500">
            per hour
          </Text>
        </Flex>

        {/* Location */}
        {service.location && (
          <Text fontSize="xs" color="gray.400">
            {service.location}
          </Text>
        )}
      </Stack>
    </MotionCard>
  );
}

export default ServiceCard;
