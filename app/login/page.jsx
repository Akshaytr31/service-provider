"use client";

import {
  Box,
  Button,
  Input,
  Stack,
  Text,
  Divider,
  Center,
  InputGroup,
  InputRightElement,
  IconButton,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    auth: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
      auth: "",
    }));
  };

  const handleContinue = async () => {
    let newErrors = {};

    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(form.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      role: "seeker",
      redirect: false,
      callbackUrl: "/post-login",
    });

    if (result?.error) {
      setErrors({ auth: "Invalid email or password" });
      return;
    }

    window.location.href = result.url;
  };

  return (
    <Box
      maxW="400px"
      mx="auto"
      mt="80px"
      p={6}
      boxShadow="md"
      borderRadius="md"
      bg="white"
      marginTop={"100px"}
    >
      <Text fontSize="2xl" fontWeight="bold" mb={6} textAlign="center">
        Sign In
      </Text>
      <Stack spacing={4}>
        <Input
          name="email"
          placeholder="Email address"
          value={form.email}
          onChange={handleChange}
          isInvalid={!!errors.email}
        />
        {errors.email && (
          <Text color="red.500" fontSize="sm">
            {errors.email}
          </Text>
        )}

        <InputGroup>
          <Input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            isInvalid={!!errors.password}
          />
          <InputRightElement>
            <IconButton
              variant="ghost"
              size="sm"
              aria-label="Toggle password"
              icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
              onClick={() => setShowPassword((prev) => !prev)}
            />
          </InputRightElement>
        </InputGroup>

        {errors.password && (
          <Text color="red.500" fontSize="sm">
            {errors.password}
          </Text>
        )}

        {errors.auth && (
          <Text color="red.500" fontSize="sm">
            {errors.auth}
          </Text>
        )}

        <Button colorScheme="blue" onClick={handleContinue} width="100%">
          Sign In
        </Button>

        <Center mt={2}>
          <Link
            href="/forgot-password"
            style={{ color: "#2b6cb0", fontSize: "14px", fontWeight: "500" }}
          >
            Forgot Password?
          </Link>
        </Center>
      </Stack>

      <Divider my={6} />

      <Button
        width="100%"
        variant="outline"
        onClick={() => {
          // Google login logic - default to seeker or handle in callback
          signIn("google", {
            callbackUrl: "/post-login",
          });
        }}
      >
        Sign in with Google
      </Button>

      <Center mt={6}>
        <Text fontSize="sm">
          Don't have an account?{" "}
          <Link
            href="/signup"
            style={{ color: "blue", textDecoration: "underline" }}
          >
            Sign Up
          </Link>
        </Text>
      </Center>
    </Box>
  );
}
