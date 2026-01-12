"use client";

import {
  Box,
  Button,
  Container,
  Heading,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";

export default function RoleSelectionPage() {
  const router = useRouter();

  const handleRoleSelect = (role) => {
    if (role === "seeker") {
      router.push("/seeker/seeker-onboarding");
    } else {
      router.push("/provider-onboarding");
    }
  };

  return (
    <Container maxW="container.md" py={20}>
      <VStack spacing={8} textAlign="center">
        <Heading>Choose Account Type</Heading>
        <Text fontSize="lg" color="gray.600">
          How would you like to use our platform?
        </Text>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} w="100%">
          {/* SEEKER */}
          <Box
            p={8}
            borderWidth="1px"
            borderRadius="lg"
            cursor="pointer"
            _hover={{ borderColor: "blue.500", boxShadow: "md" }}
            onClick={() => handleRoleSelect("seeker")}
          >
            <VStack spacing={4}>
              <Text fontSize="4xl">🔍</Text>
              <Heading size="md">I’m a Seeker</Heading>
              <Text color="gray.500">
                I want to find and book services.
              </Text>
              <Button
                colorScheme="blue"
                variant="outline"
                w="full"
              >
                Continue as Seeker
              </Button>
            </VStack>
          </Box>

          {/* PROVIDER */}
          <Box
            p={8}
            borderWidth="1px"
            borderRadius="lg"
            cursor="pointer"
            _hover={{ borderColor: "purple.500", boxShadow: "md" }}
            onClick={() => handleRoleSelect("provider")}
          >
            <VStack spacing={4}>
              <Text fontSize="4xl">🛠️</Text>
              <Heading size="md">I’m a Provider</Heading>
              <Text color="gray.500">
                I want to offer my services.
              </Text>
              <Button
                colorScheme="purple"
                variant="outline"
                w="full"
              >
                Continue as Provider
              </Button>
            </VStack>
          </Box>
        </SimpleGrid>
      </VStack>
    </Container>
  );
}
