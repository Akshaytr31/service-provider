"use client";

import {
  Box,
  Button,
  Center,
  Heading,
  Input,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Extract content to a component to use inside Suspense
function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const toast = useToast();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!otp) {
      toast({
        title: "OTP required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Verification failed");
      }

      toast({
        title: "Email verified",
        description: "You can now log in.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      router.push("/login?verified=true");
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("Failed to resend OTP");

      toast({
        title: "OTP Resent",
        description: "Check your email for a new OTP.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
      return (
          <Center flexDirection="column">
              <Text>No email provided.</Text>
              <Button mt={4} onClick={() => router.push("/signup")}>Go to Signup</Button>
          </Center>
      )
  }

  return (
    <Box maxW="400px" mx="auto" mt="80px" p={6} boxShadow="md" borderRadius="md" bg="white">
      <Heading size="lg" textAlign="center" mb={6}>
        Verify Email
      </Heading>
      <Text textAlign="center" mb={4} color="gray.600">
        Enter the 6-digit OTP sent to <strong>{email}</strong>
      </Text>

      <Stack spacing={4}>
        <Input
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          textAlign="center"
          letterSpacing="widest"
          maxLength={6}
        />
        
        <Button colorScheme="blue" onClick={handleVerify} isLoading={loading}>
          Verify OTP
        </Button>
        
        <Button variant="ghost" size="sm" onClick={handleResend} isDisabled={loading}>
          Resend OTP
        </Button>
      </Stack>
    </Box>
  );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<Center mt="80px">Loading...</Center>}>
            <VerifyEmailContent />
        </Suspense>
    );
}
