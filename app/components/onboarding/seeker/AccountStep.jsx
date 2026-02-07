import {
  Stack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Flex,
  InputGroup,
  InputRightElement,
  IconButton,
  Button,
  HStack,
  Text,
  Spinner,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon, CheckIcon, CloseIcon } from "@chakra-ui/icons";
import { useState, useEffect } from "react";

export default function AccountStep({
  form,
  setForm,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  otpSent,
  handleSendOtp,
  otpLoading,
  handleChange,
  resendTimer,
  handleResendOtp,
  handleNext,
  loading,
}) {
  const [emailError, setEmailError] = useState("");
  const [checkingEmail, setCheckingEmail] = useState(false);

  useEffect(() => {
    const checkEmail = async () => {
      if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        setEmailError("");
        return;
      }

      setCheckingEmail(true);
      try {
        const res = await fetch("/api/auth/check-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email }),
        });
        const data = await res.json();
        if (data.exists) {
          setEmailError("Email is already registered. Please login instead.");
        } else {
          setEmailError("");
        }
      } catch (error) {
        console.error("Email check failed:", error);
      } finally {
        setCheckingEmail(false);
      }
    };

    const timer = setTimeout(() => {
      checkEmail();
    }, 500);

    return () => clearTimeout(timer);
  }, [form.email]);

  return (
    <Stack
      spacing={6}
      p={8}
      bg="white"
      border="1px solid"
      borderColor="gray.100"
      borderRadius="2xl"
      boxShadow="sm"
    >
      <Heading size="sm" color="green.700" fontWeight="bold">
        Account Details
      </Heading>
      <FormControl isRequired isInvalid={!!emailError}>
        <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
          Email
        </FormLabel>
        <InputGroup>
          <Input
            type="email"
            placeholder="Email Address"
            size="sm"
            borderRadius="lg"
            focusBorderColor="green.400"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            isReadOnly={otpSent}
          />
          <InputRightElement>
            {checkingEmail ? (
              <Spinner size="xs" color="green.500" />
            ) : form.email && !emailError ? (
              <CheckIcon color="green.500" fontSize="xs" />
            ) : null}
          </InputRightElement>
        </InputGroup>
        {emailError && (
          <Text fontSize="xs" color="red.500" mt={1}>
            {emailError}
          </Text>
        )}
      </FormControl>
      <Flex gap={2}>
        <FormControl isRequired>
          <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
            Password
          </FormLabel>
          <InputGroup>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              size="sm"
              borderRadius="lg"
              focusBorderColor="green.400"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
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
        </FormControl>

        <FormControl isRequired>
          <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
            Confirm Password
          </FormLabel>
          <InputGroup>
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              size="sm"
              borderRadius="lg"
              focusBorderColor="green.400"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
            />
            <InputRightElement>
              <IconButton
                variant="ghost"
                size="sm"
                icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            </InputRightElement>
          </InputGroup>
        </FormControl>
      </Flex>

      {!otpSent ? (
        <Button
          onClick={handleSendOtp}
          isLoading={otpLoading || checkingEmail}
          isDisabled={!!emailError}
          variant="solid"
          bg="green.500"
          color="white"
          _hover={{ bg: "green.600" }}
          width="full"
          borderRadius="xl"
          fontSize="sm"
          height="45px"
          mt={2}
        >
          Send OTP to Verify
        </Button>
      ) : (
        <Stack
          spacing={4}
          bg="green.50"
          p={4}
          borderRadius="xl"
          border="1px solid"
          borderColor="green.100"
        >
          <FormControl isRequired>
            <FormLabel fontSize="xs" fontWeight="bold" color="green.700">
              Enter OTP
            </FormLabel>
            <HStack>
              <Input
                name="otp"
                placeholder="######"
                size="sm"
                borderRadius="lg"
                focusBorderColor="green.400"
                bg="white"
                fontSize="lg"
                fontWeight="bold"
                value={form.otp}
                onChange={handleChange}
                maxLength={6}
                textAlign="center"
                letterSpacing={2}
                inputMode="numeric"
                pattern="[0-9]*"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={handleResendOtp}
                isDisabled={resendTimer > 0}
                color="green.600"
                _hover={{ bg: "green.100" }}
              >
                {resendTimer > 0 ? `Resend (${resendTimer})` : "Resend"}
              </Button>
            </HStack>
          </FormControl>
          <Button
            onClick={handleNext}
            isLoading={loading}
            bg="green.600"
            color="white"
            _hover={{ bg: "green.700" }}
            width="full"
            borderRadius="xl"
            fontSize="sm"
            height="45px"
            mt={2}
          >
            Verify & Finish
          </Button>
        </Stack>
      )}
    </Stack>
  );
}
