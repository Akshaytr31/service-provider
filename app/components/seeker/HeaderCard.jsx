import {
  VStack,
  Heading,
  Text,
  Flex,
  Icon,
} from "@chakra-ui/react";
import { FiUserCheck, FiShield, FiAward } from "react-icons/fi";

export default function HeroContent() {
  return (
    <VStack align="start" spacing={6} flex={1}>
      <VStack align="start" spacing={3}>
        <Heading
          as="h1"
          size="2xl"
          color="gray.900"
          fontWeight="900"
          letterSpacing="-0.03em"
          lineHeight="1.2"
        >
          Find Expert Services
          <Text as="span" color="green.600" display="block">
            Near You
          </Text>
        </Heading>
        <Text color="gray.600" fontSize="xl" maxW="500px">
          Connect with verified, background-checked professionals for
          any job. Quality service guaranteed.
        </Text>
      </VStack>

      <Flex gap={4} flexWrap="wrap">
        <Flex
          align="center"
          gap={2}
          bg="white"
          px={4}
          py={2}
          borderRadius="full"
          shadow="sm"
          border="1px solid"
          borderColor="gray.200"
        >
          <Icon as={FiUserCheck} color="green.600" boxSize={5} />
          <Text fontSize="sm" fontWeight="600" color="gray.700">
            Verified Pros
          </Text>
        </Flex>

        <Flex
          align="center"
          gap={2}
          bg="white"
          px={4}
          py={2}
          borderRadius="full"
          shadow="sm"
          border="1px solid"
          borderColor="gray.200"
        >
          <Icon as={FiShield} color="blue.600" boxSize={5} />
          <Text fontSize="sm" fontWeight="600" color="gray.700">
            Background Checked
          </Text>
        </Flex>

        <Flex
          align="center"
          gap={2}
          bg="white"
          px={4}
          py={2}
          borderRadius="full"
          shadow="sm"
          border="1px solid"
          borderColor="gray.200"
        >
          <Icon as={FiAward} color="purple.600" boxSize={5} />
          <Text fontSize="sm" fontWeight="600" color="gray.700">
            Insured
          </Text>
        </Flex>
      </Flex>
    </VStack>
  );
}
