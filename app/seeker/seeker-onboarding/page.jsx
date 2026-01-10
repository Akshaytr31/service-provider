"use client";

import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  Select,
  Stack,
  Textarea,
  Checkbox,
  Progress,
  useToast,
  HStack,
  Text,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const TOTAL_STEPS = 4;

export default function SeekerOnboarding() {
  const router = useRouter();
  const toast = useToast();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const [form, setForm] = useState({
    dateOfBirth: "",
    gender: "",
    address: "",
    education: {
      qualification: "",
      field: "",
      institution: "",
      year: "",
    },
    termsAccepted: false,
    privacyAccepted: false,
    updatesAccepted: false,
    otp: "",
  });

  /* ================= TIMER ================= */
  useEffect(() => {
    if (resendTimer === 0) return;
    const t = setInterval(() => setResendTimer((r) => r - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  /* ================= VALIDATION ================= */
  const validateStep = () => {
    switch (step) {
      case 0:
        if (!form.dateOfBirth || !form.gender || !form.address) {
          return "Please complete all required personal details";
        }
        return null;

      case 1:
        if (
          !form.education.qualification ||
          !form.education.field ||
          !form.education.institution ||
          !form.education.year
        ) {
          return "Please complete all education details";
        }
        return null;

      case 2:
        if (!form.termsAccepted || !form.privacyAccepted) {
          return "You must accept Terms & Privacy Policy";
        }
        return null;

      case 3:
        if (!form.otp.trim()) {
          return "OTP is required";
        }
        return null;

      default:
        return null;
    }
  };

  /* ================= NAVIGATION ================= */
  const handleNext = () => {
    const error = validateStep();
    if (error) {
      toast({ title: "Validation Error", description: error, status: "error" });
      return;
    }
    if (step < TOTAL_STEPS - 1) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  /* ================= OTP ================= */
  const handleSendOtp = async () => {
    setOtpLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setOtpSent(true);
      setResendTimer(60);

      toast({ title: "OTP sent", status: "success" });
    } catch (err) {
      toast({ title: "Error", description: err.message, status: "error" });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const error = validateStep();
    if (error) {
      toast({ title: "Validation Error", description: error, status: "error" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: form.otp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast({ title: "Onboarding completed", status: "success" });
      router.push("/");
    } catch (err) {
      toast({ title: "Error", description: err.message, status: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="container.md" py={10}>
      <Heading mb={4}>Seeker Onboarding</Heading>
      <Box
        position="fixed"
        top="62px"
        left="0"
        width="100vw"
        zIndex="1"
        bg="white"
        px={4}
        padding={0}
      >
        <Progress
          h="4px"
          value={((step + 1) / TOTAL_STEPS) * 100}
          colorScheme="blue"
          borderRadius="md"
        />
      </Box>

      {/* STEP 0 */}
      {step === 0 && (
        <Stack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Date of Birth</FormLabel>
            <Input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) =>
                setForm({ ...form, dateOfBirth: e.target.value })
              }
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Gender</FormLabel>
            <Select
              placeholder="Select gender"
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
            >
              <option>Male</option>
              <option>Female</option>
              <option>Prefer not to say</option>
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Address</FormLabel>
            <Textarea
              placeholder="Full address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </FormControl>
        </Stack>
      )}

      {/* STEP 1 */}
      {step === 1 && (
        <Stack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Qualification</FormLabel>
            <Select
              placeholder="Select qualification"
              value={form.education.qualification}
              onChange={(e) =>
                setForm({
                  ...form,
                  education: {
                    ...form.education,
                    qualification: e.target.value,
                  },
                })
              }
            >
              <option>High School</option>
              <option>Diploma</option>
              <option>Bachelor’s Degree</option>
              <option>Master’s Degree</option>
              <option>Doctorate</option>
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Field of Study</FormLabel>
            <Input
              value={form.education.field}
              onChange={(e) =>
                setForm({
                  ...form,
                  education: { ...form.education, field: e.target.value },
                })
              }
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Institution</FormLabel>
            <Input
              value={form.education.institution}
              onChange={(e) =>
                setForm({
                  ...form,
                  education: { ...form.education, institution: e.target.value },
                })
              }
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Year of Completion</FormLabel>
            <Input
              value={form.education.year}
              onChange={(e) =>
                setForm({
                  ...form,
                  education: { ...form.education, year: e.target.value },
                })
              }
            />
          </FormControl>
        </Stack>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <Stack spacing={4}>
          <Checkbox
            isChecked={form.termsAccepted}
            onChange={(e) =>
              setForm({ ...form, termsAccepted: e.target.checked })
            }
          >
            I agree to Terms & Conditions *
          </Checkbox>

          <Checkbox
            isChecked={form.privacyAccepted}
            onChange={(e) =>
              setForm({ ...form, privacyAccepted: e.target.checked })
            }
          >
            I agree to Privacy Policy *
          </Checkbox>

          <Checkbox
            isChecked={form.updatesAccepted}
            onChange={(e) =>
              setForm({ ...form, updatesAccepted: e.target.checked })
            }
          >
            Receive updates (optional)
          </Checkbox>
        </Stack>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <Stack spacing={4}>
          <FormControl isRequired>
            <FormLabel>OTP</FormLabel>
            <Input
              placeholder="Enter OTP"
              value={form.otp}
              onChange={(e) => setForm({ ...form, otp: e.target.value })}
            />
          </FormControl>

          {!otpSent ? (
            <Button onClick={handleSendOtp} isLoading={otpLoading}>
              Send OTP
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={handleSendOtp}
              isDisabled={resendTimer > 0}
            >
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
            </Button>
          )}

          <Button
            colorScheme="green"
            onClick={handleVerifyOtp}
            isLoading={loading}
          >
            Verify & Finish
          </Button>
        </Stack>
      )}

      <HStack mt={6} justify="space-between">
        <Button variant="outline" onClick={handleBack} isDisabled={step === 0}>
          Back
        </Button>
        {step < 3 && (
          <Button colorScheme="blue" onClick={handleNext}>
            Next
          </Button>
        )}
      </HStack>
    </Container>
  );
}
