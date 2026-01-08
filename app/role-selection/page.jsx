"use client";

import {
  Box,
  Button,
  Container,
  Heading,
  SimpleGrid,
  Text,
  VStack,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function RoleSelectionPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  /* ----------------------------------------
     AUTH GUARD – VERY IMPORTANT
  ---------------------------------------- */
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <Container maxW="container.md" py={20} textAlign="center">
        <Spinner size="xl" />
      </Container>
    );
  }

  if (!session) return null;

  /* ----------------------------------------
     HANDLE ROLE SELECTION
  ---------------------------------------- */
  const handleRoleSelect = async (role) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/update-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", 
        body: JSON.stringify({ role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update role");
      }

      // Update NextAuth session (JWT)
      await update({
        user: {
          ...session.user,
          role,
          isProviderAtFirst: role === "provider",
        },
      });

      // Redirect based on role
      if (role === "seeker") {
        router.push("/seeker/seeker-onboarding");
      } else {
        router.push("/provider-onboarding");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------------------
     UI
  ---------------------------------------- */
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
                isLoading={loading}
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
                isLoading={loading}
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
