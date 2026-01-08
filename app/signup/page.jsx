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
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "", auth: "" }));
  };

  const handleSignup = async () => {
    let newErrors = {};

    if (!form.firstName.trim()) newErrors.firstName = "First name is required";
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required";

    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(form.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ auth: data.message || "Something went wrong" });
        return;
      }

      await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      router.push("/role-selection");
    } catch {
      setErrors({ auth: "Unexpected error. Please try again." });
    }
  };

  return (
    <Box maxW="400px" mx="auto" mt="80px" p={6} boxShadow="md" borderRadius="md" bg="white">
      <Text fontSize="2xl" fontWeight="bold" mb={6} textAlign="center">
        Create an Account
      </Text>

      <Stack spacing={4}>
        <Stack direction="row" spacing={4}>
          <Input
            name="firstName"
            placeholder="First Name"
            value={form.firstName}
            onChange={handleChange}
            isInvalid={!!errors.firstName}
          />
          <Input
            name="lastName"
            placeholder="Last Name"
            value={form.lastName}
            onChange={handleChange}
            isInvalid={!!errors.lastName}
          />
        </Stack>

        <Input
          name="email"
          placeholder="Email address"
          value={form.email}
          onChange={handleChange}
          isInvalid={!!errors.email}
        />

        {/* PASSWORD */}
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
              onClick={() => setShowPassword(!showPassword)}
            />
          </InputRightElement>
        </InputGroup>

        {/* CONFIRM PASSWORD */}
        <InputGroup>
          <Input
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            isInvalid={!!errors.confirmPassword}
          />
          <InputRightElement>
            <IconButton
              variant="ghost"
              size="sm"
              aria-label="Toggle confirm password"
              icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
            />
          </InputRightElement>
        </InputGroup>

        {(errors.password || errors.confirmPassword || errors.auth) && (
          <Text color="red.500" fontSize="sm">
            {errors.password || errors.confirmPassword || errors.auth}
          </Text>
        )}

        <Button colorScheme="blue" onClick={handleSignup} width="100%">
          Sign Up
        </Button>
      </Stack>

      <Divider my={6} />

      <Button
        width="100%"
        variant="outline"
        onClick={() =>
          signIn("google", { callbackUrl: "/role-selection" })
        }
      >
        Sign up with Google
      </Button>

      <Center mt={6}>
        <Text fontSize="sm">
          Already have an account?{" "}
          <Link href="/login" style={{ color: "blue", textDecoration: "underline" }}>
            Log In
          </Link>
        </Text>
      </Center>
    </Box>
  );
}
