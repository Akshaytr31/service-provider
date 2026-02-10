import {
  Box,
  VStack,
  Heading,
  SimpleGrid,
  Flex,
  Text,
  Icon,
} from "@chakra-ui/react";
import { FiUserCheck, FiBriefcase, FiAward } from "react-icons/fi";

export default function PlatformStatsCard() {
  return (
    <Box
      bg="white"
      p={8}
      borderRadius="2xl"
      shadow="xl"
      border="1px solid"
      borderColor="gray.200"
      minW={{ base: "full", lg: "400px" }}
    >
      <VStack spacing={6} align="stretch">
        <Heading size="md" color="gray.800" textAlign="center">
          Platform Stats
        </Heading>

        <SimpleGrid columns={1} spacing={4}>
          <Flex align="center" gap={4}>
            <Box bg="green.50" p={3} borderRadius="lg">
              <Icon as={FiUserCheck} color="green.600" boxSize={6} />
            </Box>
            <VStack align="start" spacing={0}>
              <Text fontSize="2xl" fontWeight="bold" color="gray.900">
                5,000+
              </Text>
              <Text fontSize="sm" color="gray.600">
                Verified Professionals
              </Text>
            </VStack>
          </Flex>

          <Flex align="center" gap={4}>
            <Box bg="blue.50" p={3} borderRadius="lg">
              <Icon as={FiBriefcase} color="blue.600" boxSize={6} />
            </Box>
            <VStack align="start" spacing={0}>
              <Text fontSize="2xl" fontWeight="bold" color="gray.900">
                10,000+
              </Text>
              <Text fontSize="sm" color="gray.600">
                Jobs Completed
              </Text>
            </VStack>
          </Flex>

          <Flex align="center" gap={4}>
            <Box bg="purple.50" p={3} borderRadius="lg">
              <Icon as={FiAward} color="purple.600" boxSize={6} />
            </Box>
            <VStack align="start" spacing={0}>
              <Text fontSize="2xl" fontWeight="bold" color="gray.900">
                98%
              </Text>
              <Text fontSize="sm" color="gray.600">
                Customer Satisfaction
              </Text>
            </VStack>
          </Flex>
        </SimpleGrid>
      </VStack>
    </Box>
  );
}
