import {
  Stack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  HStack,
  Button,
  Text,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useState } from "react";

export default function AccountStep({
  formData,
  handleChange,
  status,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  otpSent,
  handleSendOtp,
  otpLoading,
  resendTimer,
  handleResendOtp,
  accountErrors,
  setAccountErrors,
}) {
  const clearError = (field) => {
    setAccountErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <Stack
      spacing={4}
      alignItems={"center"}
      maxWidth={"600px"}
      p={8}
      bg="white"
      border="1px solid"
      borderColor="gray.100"
      borderRadius="2xl"
      boxShadow="sm"
    >
      {/* ACCOUNT FIELDS (Unauthenticated Only) */}
      {status !== "authenticated" ? (
        <Stack spacing={4} w="full" pb={4}>
          <Heading size="sm" color="green.700" fontWeight="bold">
            Account Setup
          </Heading>

          <FormControl isRequired isInvalid={!!accountErrors?.email}>
            <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
              Email
            </FormLabel>
            <Input
              name="email"
              type="email"
              placeholder="Email Address"
              borderRadius="lg"
              fontSize="sm"
              focusBorderColor="green.400"
              onChange={(e) => {
                handleChange(e);
                clearError("email");
              }}
              value={formData.email}
            />
            {accountErrors?.email && (
              <Text color="red.500" fontSize="xs" mt={1}>
                {accountErrors.email}
              </Text>
            )}
          </FormControl>

          <Stack direction="row" spacing={4}>
            <FormControl isRequired isInvalid={!!accountErrors?.password}>
              <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
                Password
              </FormLabel>
              <InputGroup>
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  borderRadius="lg"
                  fontSize="sm"
                  focusBorderColor="green.400"
                  onChange={(e) => {
                    handleChange(e);
                    clearError("password");
                  }}
                  value={formData.password}
                />
                <InputRightElement>
                  <IconButton
                    size="sm"
                    variant="ghost"
                    icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                    onClick={() => setShowPassword(!showPassword)}
                  />
                </InputRightElement>
              </InputGroup>
              {accountErrors?.password && (
                <Text color="red.500" fontSize="xs" mt={1}>
                  {accountErrors.password}
                </Text>
              )}
            </FormControl>

            <FormControl
              isRequired
              isInvalid={!!accountErrors?.confirmPassword}
            >
              <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
                Confirm Password
              </FormLabel>
              <InputGroup>
                <Input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  borderRadius="lg"
                  fontSize="sm"
                  focusBorderColor="green.400"
                  onChange={(e) => {
                    handleChange(e);
                    clearError("confirmPassword");
                  }}
                  value={formData.confirmPassword}
                />
                <InputRightElement>
                  <IconButton
                    size="sm"
                    variant="ghost"
                    icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                </InputRightElement>
              </InputGroup>

              {accountErrors?.confirmPassword && (
                <Text color="red.500" fontSize="xs" mt={1}>
                  {accountErrors.confirmPassword}
                </Text>
              )}
            </FormControl>
          </Stack>

          {/* OTP LOGIC */}
          {!otpSent ? (
            <Button
              onClick={handleSendOtp}
              isLoading={otpLoading}
              variant="solid"
              bg="green.500"
              color="white"
              _hover={{ bg: "green.600" }}
              width="full"
              borderRadius="xl"
              fontSize="sm"
              height="45px"
            >
              Send OTP to Verify Email
            </Button>
          ) : (
            <Stack
              spacing={2}
              bg="green.50"
              p={4}
              borderRadius="xl"
              border="1px solid"
              borderColor="green.100"
            >
              <FormControl isRequired isInvalid={!!accountErrors?.otp}>
                <FormLabel fontSize="xs" fontWeight="bold" color="green.700">
                  Enter OTP sent to {formData.email}
                </FormLabel>
                <HStack>
                  <Input
                    name="otp"
                    placeholder="######"
                    value={formData.otp}
                    onChange={(e) => {
                      handleChange(e);
                      clearError("otp");
                    }}
                    maxLength={6}
                    textAlign="center"
                    letterSpacing={2}
                    bg="white"
                    borderRadius="lg"
                    fontSize="lg"
                    fontWeight="bold"
                    focusBorderColor="green.400"
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
                {accountErrors?.otp && (
                  <Text color="red.500" fontSize="xs" mt={1}>
                    {accountErrors.otp}
                  </Text>
                )}
              </FormControl>
            </Stack>
          )}
        </Stack>
      ) : (
        <Stack spacing={2} alignItems={"center"}>
          <Heading size="sm" color="green.600">
            Welcome back, {formData.firstName || "Provider"}!
          </Heading>
          <Text fontSize="sm" color="gray.600">
            Click Next to continue your application.
          </Text>
        </Stack>
      )}
    </Stack>
  );
}
