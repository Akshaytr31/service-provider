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
  Heading,
  Container,
  VStack,
  FormControl,
  FormLabel,
  HStack,
  Flex,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

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
      minH="100vh"
      w="100%"
      bg="white"
      position="relative"
      overflow="hidden"
      display="flex"
      alignItems="center"
      justifyContent="center"
      marginTop={"30px"}
      px={4}
    >
      {/* Background Decorative Blobs */}
      <MotionBox
        position="absolute"
        top="-10%"
        right="-5%"
        w="600px"
        h="600px"
        bgGradient="radial(green.50, transparent)"
        borderRadius="full"
        filter="blur(100px)"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.4, 0.3],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <MotionBox
        position="absolute"
        bottom="-10%"
        left="-10%"
        w="500px"
        h="500px"
        bgGradient="radial(green.100, transparent)"
        borderRadius="full"
        filter="blur(100px)"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <Container maxW="container.lg" position="relative" zIndex={1}>
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          overflow="hidden"
          borderRadius="xl"
          bg="white"
          boxShadow="0 25px 50px -12px rgba(72, 187, 120, 0.12)"
          border="1px solid"
          borderColor="gray.100"
        >
          <Flex direction={{ base: "column", md: "row" }} >
            {/* Left Column: Social & Sign Up */}
            <Box
              flex={1}
              bg="green.500"
              p={1}
              color="white"
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              textAlign="center"
              position="relative"
              _after={{
                content: '""',
                position: "absolute",
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                bgGradient: "linear(to-br, transparent, rgba(0,0,0,0.1))",
                pointerEvents: "none",
              }}
            >
              <VStack spacing={6} zIndex={1}>
                <Heading size="xl" fontWeight="extrabold">
                  New Here?
                </Heading>
                <Text
                  fontSize="md"
                  opacity={0.9}
                  fontWeight="medium"
                  maxW="300px"
                >
                  Join our community and start your journey with us today.
                </Text>

                <MotionBox
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  w="full"
                >
                  <Button
                    w="full"
                    bg="white"
                    color="green.600"
                    h="40px"
                    borderRadius="xl"
                    boxShadow="xl"
                    leftIcon={
                      <svg width="20" height="20" viewBox="0 0 24 24">
                        <path
                          fill="#EA4335"
                          d="M5.266 9.765A7.077 7.077 0 0112 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M16.04 18.013c-1.09.693-2.43 1.078-3.9 1.078-3.14 0-5.85-2.074-6.864-4.94l-4.04 3.126C3.25 21.24 7.37 24 12 24c3.05 0 5.68-1.01 7.42-2.73l-3.38-3.257z"
                        />
                        <path
                          fill="#4285F4"
                          d="M19.835 7.5c.102.492.165 1.003.165 1.535 0 1.453-.25 2.857-.708 4.15l3.447 3.32C23.635 15.223 24 13.655 24 12c0-5.188-3.078-9.488-7.5-11.455l-3.38 3.257C17.31 5.093 18.89 6.16 19.835 7.5z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 19.091c-3.14 0-5.85-2.073-6.864-4.82l-4.04 3.125C3.251 21.2 7.371 24 12 24c3.05 0 5.68-1.01 7.42-2.727l-3.38-3.257z"
                        />
                      </svg>
                    }
                    onClick={() => {
                      signIn("google", {
                        callbackUrl: "/post-login",
                      });
                    }}
                    _hover={{
                      bg: "gray.50",
                      boxShadow: "2xl",
                    }}
                  >
                    Google
                  </Button>
                </MotionBox>

                <HStack w="full" my={4}>
                  <Divider borderColor="whiteAlpha.400" />
                  <Text
                    fontSize="xs"
                    fontWeight="bold"
                    opacity={0.6}
                    whiteSpace="nowrap"
                  >
                    OR
                  </Text>
                  <Divider borderColor="whiteAlpha.400" />
                </HStack>

                <Link href="/signup">
                  <Button
                    variant="link"
                    color="white"
                    fontSize="sm"
                    fontWeight="bold"
                    textDecoration="underline"
                    _hover={{ opacity: 0.8 }}
                  >
                    Create Account
                  </Button>
                </Link>
              </VStack>
            </Box>

            {/* Right Column: Credentials Login */}
            <Box flex={1.2} p={{ base: 8, md: 16 }} bg="white">
              <VStack
                spacing={8}
                align="stretch"
                h="full"
                justifyContent="center"
              >
                <Box mb={2}>
                  <Heading size="lg" fontWeight="extrabold" color="gray.800">
                    Sign In
                  </Heading>
                  <Text color="gray.500" fontSize="sm" mt={2}>
                    Enter your credentials to access your account.
                  </Text>
                </Box>

                <Stack spacing={4}>
                  <FormControl isRequired isInvalid={!!errors.email}>
                    <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
                      Email address
                    </FormLabel>
                    <Input
                      name="email"
                      placeholder="e.g. name@example.com"
                      borderRadius="xl"
                      value={form.email}
                      onChange={handleChange}
                      focusBorderColor="green.400"
                      bg="gray.50"
                      border="1px solid"
                      borderColor="gray.100"
                      fontSize="sm"
                      _placeholder={{ color: "gray.400" }}
                    />
                    {errors.email && (
                      <Text color="red.500" fontSize="xs" >
                        {errors.email}
                      </Text>
                    )}
                  </FormControl>

                  <FormControl isRequired isInvalid={!!errors.password}>
                    <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
                      Password
                    </FormLabel>
                    <InputGroup >
                      <Input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        borderRadius="xl"
                        fontSize="sm"
                        value={form.password}
                        onChange={handleChange}
                        focusBorderColor="green.400"
                        bg="gray.50"
                        border="1px solid"
                        borderColor="gray.100"
                        _placeholder={{ color: "gray.400" }}
                      />
                      <InputRightElement h="full">
                        <IconButton
                          variant="ghost"
                          size="sm"
                          aria-label="Toggle password"
                          icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                          onClick={() => setShowPassword((prev) => !prev)}
                          color="gray.400"
                          _hover={{ color: "green.500", bg: "transparent" }}
                        />
                      </InputRightElement>
                    </InputGroup>
                    {errors.password && (
                      <Text color="red.500" fontSize="xs" >
                        {errors.password}
                      </Text>
                    )}
                  </FormControl>

                  <Box textAlign="right">
                    <Link
                      href="/forgot-password"
                      style={{
                        color: "#718096",
                        fontSize: "12px",
                        fontWeight: "bold",
                        transition: "color 0.2s",
                      }}
                      onMouseOver={(e) => (e.target.style.color = "#48BB78")}
                      onMouseOut={(e) => (e.target.style.color = "#718096")}
                    >
                      Forgot password?
                    </Link>
                  </Box>

                  {errors.auth && (
                    <Box
                      bg="red.50"
                      p={3}
                      borderRadius="lg"
                      border="1px solid"
                      borderColor="red.100"
                    >
                      <Text
                        color="red.500"
                        fontSize="xs"
                        textAlign="center"
                        fontWeight="bold"
                      >
                        {errors.auth}
                      </Text>
                    </Box>
                  )}

                  <MotionBox
                    whileHover={{ translateY: -2 }}
                    whileTap={{ translateY: 0 }}
                  >
                    <Button
                      bg="green.500"
                      color="white"
                      size="lg"
                      w="full"
                      h="40px"
                      fontSize="18px"
                      fontWeight="bold"
                      borderRadius="xl"
                      boxShadow="0 15px 25px -5px rgba(72, 187, 120, 0.4)"
                      onClick={handleContinue}
                      _hover={{
                        bg: "green.600",
                        boxShadow: "0 20px 30px -10px rgba(72, 187, 120, 0.5)",
                      }}
                      transition="all 0.3s"
                    >
                      Sign In
                    </Button>
                  </MotionBox>
                </Stack>
              </VStack>
            </Box>
          </Flex>
        </MotionBox>
      </Container>
    </Box>
  );
}
