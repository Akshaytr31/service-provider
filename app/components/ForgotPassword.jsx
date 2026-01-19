"use client";

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
  Heading,
  useToast,
  InputGroup,
  InputRightElement,
  IconButton,
  VStack,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const toast = useToast();
  const router = useRouter();

  const handleSendOtp = async () => {
    if (!email) {
      setErrors({ email: "Email is required" });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send OTP");
      }

      toast({
        title: "OTP Sent",
        description: "Check your email for the verification code.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      setStep(2);
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const newErrors = {};
    if (!otp) newErrors.otp = "OTP is required";
    if (!newPassword) newErrors.newPassword = "New password is required";
    if (newPassword !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      toast({
        title: "Success",
        description: "Your password has been reset successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      router.push("/login");
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      maxW="450px"
      mx="auto"
      p={8}
      boxShadow="2xl"
      borderRadius="xl"
      bg="white"
      border="1px solid"
      borderColor="gray.100"
    >
      <VStack spacing={6} align="stretch">
        <Stack spacing={2} textAlign="center">
          <Heading size="lg" color="blue.600">
            {step === 1 ? "Forgot Password?" : "Reset Password"}
          </Heading>
          <Text fontSize="sm" color="gray.500">
            {step === 1
              ? "Enter your email address and we'll send you an OTP to reset your password."
              : `Enter the OTP sent to ${email} and your new password.`}
          </Text>
        </Stack>

        {step === 1 ? (
          <Stack spacing={4}>
            <FormControl isInvalid={!!errors.email}>
              <FormLabel fontSize="sm" fontWeight="600">
                Email Address
              </FormLabel>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors({});
                }}
              />
              {errors.email && (
                <Text color="red.500" fontSize="xs" mt={1}>
                  {errors.email}
                </Text>
              )}
            </FormControl>

            <Button
              colorScheme="blue"
              size="lg"
              fontSize="md"
              isLoading={loading}
              onClick={handleSendOtp}
              width="100%"
            >
              Send OTP
            </Button>
          </Stack>
        ) : (
          <Stack spacing={4}>
            <FormControl isInvalid={!!errors.otp}>
              <FormLabel fontSize="sm" fontWeight="600">
                OTP Code
              </FormLabel>
              <Input
                placeholder="6-digit code"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ""));
                  setErrors({});
                }}
                textAlign="center"
                letterSpacing="4px"
                fontWeight="bold"
                fontSize="xl"
              />
              {errors.otp && (
                <Text color="red.500" fontSize="xs" mt={1}>
                  {errors.otp}
                </Text>
              )}
            </FormControl>

            <FormControl isInvalid={!!errors.newPassword}>
              <FormLabel fontSize="sm" fontWeight="600">
                New Password
              </FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setErrors({});
                  }}
                />
                <InputRightElement>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                    onClick={() => setShowPassword(!showPassword)}
                  />
                </InputRightElement>
              </InputGroup>
              {errors.newPassword && (
                <Text color="red.500" fontSize="xs" mt={1}>
                  {errors.newPassword}
                </Text>
              )}
            </FormControl>

            <FormControl isInvalid={!!errors.confirmPassword}>
              <FormLabel fontSize="sm" fontWeight="600">
                Confirm New Password
              </FormLabel>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrors({});
                }}
              />
              {errors.confirmPassword && (
                <Text color="red.500" fontSize="xs" mt={1}>
                  {errors.confirmPassword}
                </Text>
              )}
            </FormControl>

            <Button
              colorScheme="blue"
              size="lg"
              fontSize="md"
              isLoading={loading}
              onClick={handleResetPassword}
              width="100%"
            >
              Reset Password
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep(1)}
              isDisabled={loading}
            >
              Back to Email Input
            </Button>
          </Stack>
        )}

        <Box textAlign="center">
          <Link href="/login">
            <Text
              fontSize="sm"
              color="blue.500"
              _hover={{ textDecoration: "underline" }}
            >
              Back to Login
            </Text>
          </Link>
        </Box>
      </VStack>
    </Box>
  );
}
