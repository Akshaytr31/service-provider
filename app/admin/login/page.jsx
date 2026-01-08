"use client";

import {
  Box,
  Button,
  Input,
  Stack,
  Text,
  Divider,
  useToast,
} from "@chakra-ui/react";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", adminKey: "" });
  const toast = useToast();
  const router = useRouter();

  const handleContinue = async () => {
    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      adminKey: isRegistering ? form.adminKey : undefined,
      redirect: false,
    });

    if (res?.error) {
      toast({
        title: "Login Failed",
        description: "Invalid credentials",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } else {
      router.push("/adminDashboard");
    }
  };

  return (
    <Box maxW="400px" mx="auto" mt="80px" p={6} boxShadow="md" borderRadius="md" bg="white">
      <Text fontSize="xl" fontWeight="bold" mb={4} textAlign="center" color="red.500">
        {isRegistering ? "Create Admin Account" : "Admin Login"}
      </Text>

      <Stack spacing={4}>
        <Input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <Input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        {isRegistering && (
          <Input
            type="password"
            placeholder="Admin Secret Key"
            value={form.adminKey}
            onChange={(e) => setForm({ ...form, adminKey: e.target.value })}
          />
        )}

        <Button colorScheme="red" onClick={handleContinue} width="100%">
          {isRegistering ? "Register Admin" : "Login"}
        </Button>

        <Button 
          variant="link" 
          size="sm" 
          onClick={() => setIsRegistering(!isRegistering)}
        >
          {isRegistering ? "Already have an account? Login" : "Need to create an admin account?"}
        </Button>
      </Stack>

      <Divider my={6} />
      
      <Text fontSize="sm" textAlign="center" color="gray.500">
        Unauthorized access is prohibited.
      </Text>
    </Box>
  );
}
