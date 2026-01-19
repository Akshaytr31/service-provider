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
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

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
  return (
    <Stack spacing={4}>
      <Heading size="md">Account Details</Heading>
      <FormControl isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </FormControl>
      <Flex gap={2}>
        <FormControl isRequired>
          <FormLabel>Password</FormLabel>
          <InputGroup>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
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
          <FormLabel>Confirm Password</FormLabel>
          <InputGroup>
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
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
          isLoading={otpLoading}
          variant="outline"
          colorScheme="blue"
          mt={2}
        >
          Send OTP to Verify
        </Button>
      ) : (
        <Stack spacing={2}>
          <FormControl isRequired>
            <FormLabel fontSize="sm" fontWeight="bold">
              Enter OTP
            </FormLabel>
            <HStack>
              <Input
                name="otp"
                placeholder="######"
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
                color="blue.500"
              >
                {resendTimer > 0 ? `Resend (${resendTimer})` : "Resend"}
              </Button>
            </HStack>
          </FormControl>
          <Button
            onClick={handleNext}
            isLoading={loading}
            colorScheme="green"
            width="full"
            mt={2}
          >
            Verify & Finish
          </Button>
        </Stack>
      )}
    </Stack>
  );
}
