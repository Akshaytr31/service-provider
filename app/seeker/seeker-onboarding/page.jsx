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
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const TOTAL_STEPS = 4;

export default function SeekerOnboarding() {
  const router = useRouter();
  const toast = useToast();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  /* ================= OTP STATE ================= */
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
    const t = setInterval(() => {
      setResendTimer((r) => r - 1);
    }, 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  /* ================= HELPERS ================= */
  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  /* ================= SEND OTP ================= */
  const handleSendOtp = async () => {
    setOtpLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setOtpSent(true);
      setResendTimer(60);

      toast({
        title: "OTP sent",
        description: "Check your email inbox",
        status: "success",
      });
    } catch (err) {
      toast({ title: "Error", description: err.message, status: "error" });
    } finally {
      setOtpLoading(false);
    }
  };

  /* ================= VERIFY OTP ================= */
  const handleVerifyOtp = async () => {
    if (!form.otp.trim()) {
      toast({ title: "OTP required", status: "error" });
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

      toast({ title: "Email verified", status: "success" });
      router.push("/");
    } catch (err) {
      toast({ title: "Error", description: err.message, status: "error" });
    } finally {
      setLoading(false);
    }
  };

  /* ================= NEXT ================= */
  const handleNext = async () => {
    if (step === 2) {
      if (!form.termsAccepted || !form.privacyAccepted) {
        toast({
          title: "Accept required consents",
          status: "error",
        });
        return;
      }
    }

    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    }
  };

  return (
    <Container maxW="container.md" py={10}>
      <Heading mb={4}>Seeker Onboarding</Heading>
      <Progress mb={4} value={((step + 1) / TOTAL_STEPS) * 100} />

      {/* STEP 0 */}
      {step === 0 && (
        <Stack>
          <Input
            type="date"
            onChange={(e) =>
              setForm({ ...form, dateOfBirth: e.target.value })
            }
          />
          <Select
            placeholder="Gender"
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
          >
            <option>Male</option>
            <option>Female</option>
            <option>Prefer not to say</option>
          </Select>
          <Textarea
            placeholder="Full Address"
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </Stack>
      )}

      {/* STEP 1 */}
      {step === 1 && (
        <Stack>
          <Select
            placeholder="Qualification"
            onChange={(e) =>
              setForm({
                ...form,
                education: { ...form.education, qualification: e.target.value },
              })
            }
          >
            <option>High School</option>
            <option>Diploma</option>
            <option>Bachelor’s Degree</option>
            <option>Master’s Degree</option>
            <option>Doctorate</option>
          </Select>
          <Input
            placeholder="Field of Study"
            onChange={(e) =>
              setForm({
                ...form,
                education: { ...form.education, field: e.target.value },
              })
            }
          />
          <Input
            placeholder="Institution"
            onChange={(e) =>
              setForm({
                ...form,
                education: { ...form.education, institution: e.target.value },
              })
            }
          />
          <Input
            placeholder="Year of Completion"
            onChange={(e) =>
              setForm({
                ...form,
                education: { ...form.education, year: e.target.value },
              })
            }
          />
        </Stack>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <Stack>
          <Checkbox
            onChange={(e) =>
              setForm({ ...form, termsAccepted: e.target.checked })
            }
          >
            I agree to Terms & Conditions
          </Checkbox>
          <Checkbox
            onChange={(e) =>
              setForm({ ...form, privacyAccepted: e.target.checked })
            }
          >
            I agree to Privacy Policy
          </Checkbox>
          <Checkbox
            onChange={(e) =>
              setForm({ ...form, updatesAccepted: e.target.checked })
            }
          >
            Receive updates (optional)
          </Checkbox>
        </Stack>
      )}

      {/* STEP 3 — OTP */}
      {step === 3 && (
        <Stack spacing={4}>
          <Input
            placeholder="Enter OTP"
            value={form.otp}
            onChange={(e) => setForm({ ...form, otp: e.target.value })}
          />

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
              {resendTimer > 0
                ? `Resend in ${resendTimer}s`
                : "Resend OTP"}
            </Button>
          )}

          <Button colorScheme="green" onClick={handleVerifyOtp} isLoading={loading}>
            Verify & Finish
          </Button>

          {resendTimer > 0 && (
            <Text fontSize="sm">You can resend OTP in {resendTimer}s</Text>
          )}
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
