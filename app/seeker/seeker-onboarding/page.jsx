"use client";

import { signIn, useSession } from "next-auth/react";

import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Progress,
  useToast,
} from "@chakra-ui/react";
import AccountStep from "@/app/components/onboarding/seeker/AccountStep";
import BasicInfoStep from "@/app/components/onboarding/seeker/BasicInfoStep";
import AddressStep from "@/app/components/onboarding/seeker/AddressStep";
import EducationStep from "@/app/components/onboarding/seeker/EducationStep";
import LegalStep from "@/app/components/onboarding/seeker/LegalStep";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const TOTAL_STEPS = 5;

export default function SeekerOnboarding() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const toast = useToast();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      setStep(1); // Skip Account Step
    }
  }, [status]);

  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [privacyPolicy, setPrivacyPolicy] = useState("");

  const [form, setForm] = useState({
    userType: "individual",
    dateOfBirth: "",
    gender: "",
    address: "",
    city: "",
    zipCode: "",
    state: "",
    country: "",
    // Individual fields
    firstName: "",
    lastName: "",
    idType: "",
    idNumber: "",
    backgroundCheckConsent: false,
    // Business fields
    businessName: "",
    businessType: "Company",
    registrationNumber: "",
    establishmentYear: "",
    trnNumber: "",
    expiryDate: "",
    // Education
    education: {
      qualification: "",
      field: "",
      institution: "",
      year: "",
    },
    termsAccepted: false,
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    const numericFields = [
      "zipCode",
      "establishmentYear",
      "registrationNumber",
      "trnNumber",
      "otp",
    ];

    let finalValue = value;

    if (numericFields.includes(name)) {
      finalValue = value.replace(/\D/g, "");
    }

    setForm((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  useEffect(() => {
    const fetchPrivacyPolicy = async () => {
      try {
        const res = await fetch("/api/admin/privacyPolicy");
        const data = await res.json();
        if (data?.content) {
          setPrivacyPolicy(data.content);
        }
      } catch (error) {
        console.error("Failed to fetch privacy policy:", error);
      }
    };
    fetchPrivacyPolicy();
  }, []);

  /* ================= TIMER ================= */
  useEffect(() => {
    if (resendTimer === 0) return;
    const t = setInterval(() => setResendTimer((r) => r - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  /* ================= VALIDATION ================= */
  const validateStep = () => {
    switch (step) {
      // STEP 0 – Account + OTP
      case 0:
        if (!form.email || !form.password || !form.confirmPassword) {
          return "Email and password are required";
        }
        if (form.password !== form.confirmPassword) {
          return "Passwords do not match";
        }
        if (otpSent && !form.otp) {
          return "Please enter OTP";
        }
        return null;

      // STEP 1 – User type and basic details
      case 1:
        if (!form.userType) {
          return "Please select user type";
        }
        if (form.userType === "individual") {
          if (!form.firstName || !form.lastName) {
            return "First and last name are required";
          }
          if (!form.idType || !form.idNumber) {
            return "ID type and ID number are required";
          }
        } else if (form.userType === "business") {
          if (
            !form.businessName ||
            !form.businessType ||
            !form.registrationNumber ||
            !form.establishmentYear ||
            !form.trnNumber ||
            !form.expiryDate
          ) {
            return "Please complete all business details";
          }
        }
        return null;

      // STEP 2 – Address fields
      case 2:
        if (
          !form.city ||
          !form.zipCode ||
          !form.state ||
          !form.country ||
          !form.address
        ) {
          return "Please complete all address fields";
        }
        return null;

      // STEP 3 – Education (ONLY for individual)
      case 3:
        if (form.userType === "business") return null;

        if (
          !form.education.qualification ||
          !form.education.field ||
          !form.education.institution ||
          !form.education.year
        ) {
          return "Please complete education details";
        }
        return null;

      // STEP 4 – Legal
      case 4:
        if (!form.termsAccepted) {
          return "You must accept Terms & Privacy Policy";
        }
        return null;

      default:
        return null;
    }
  };

  /* ================= OTP ================= */
  const handleSendOtp = async () => {
    setOtpLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });

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

  const handleResendOtp = handleSendOtp;

  /* ================= NAVIGATION ================= */
  const handleNext = async () => {
    const error = validateStep();
    if (error) {
      toast({ title: "Validation Error", description: error, status: "error" });
      return;
    }

    // STEP 0 – OTP FLOW
    if (step === 0) {
      if (!otpSent) {
        await handleSendOtp();
        return;
      }

      // verify OTP
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, otp: form.otp }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast({ title: data.message || "Invalid OTP", status: "error" });
        return;
      }

      toast({ title: "Email verified", status: "success" });
      setStep(1);
      return;
    }

    // FINAL STEP → CREATE ACCOUNT
    if (step === TOTAL_STEPS - 1) {
      setLoading(true);
      try {
        const payload = {
          email: form.email,
          password: form.password,
          userType: form.userType,
          dateOfBirth: form.dateOfBirth || null,
          gender: form.gender || null,
          address: form.address || null,
          city: form.city || null,
          zipCode: form.zipCode || null,
          state: form.state || null,
          country: form.country || null,
          // Individual fields
          firstName: form.firstName || null,
          lastName: form.lastName || null,
          idType: form.idType || null,
          idNumber: form.idNumber || null,
          backgroundCheckConsent: form.backgroundCheckConsent || false,
          // Business fields
          businessName: form.businessName || null,
          businessType: form.businessType || null,
          registrationNumber: form.registrationNumber || null,
          establishmentYear: form.establishmentYear || null,
          trnNumber: form.trnNumber || null,
          businessExpiryDate: form.expiryDate || null,
          // Education
          education: form.userType === "individual" ? form.education : null,
          // Terms
          acceptedTermsandconditions: form.termsAccepted || false,
        };

        console.log(
          "Submitting Seeker Onboarding Payload:",
          JSON.stringify(payload, null, 2),
        );

        if (status === "authenticated") {
          // Authenticated User -> Update Profile
          const res = await fetch("/api/seeker/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Profile update failed");

          toast({ title: "Profile updated!", status: "success" });
          router.push("/");
          return;
        }

        // Unauthenticated -> Signup
        const res = await fetch("/api/auth/signup-seeker", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Signup failed");

        await signIn("credentials", {
          redirect: false,
          email: form.email,
          password: form.password,
        });

        toast({ title: "Onboarding completed", status: "success" });
        router.push("/");
      } catch (err) {
        toast({ title: "Error", description: err.message, status: "error" });
      } finally {
        setLoading(false);
      }
      return;
    }

    // NORMAL NEXT - skip step 3 (education) for business users
    if (step === 2 && form.userType === "business") {
      setStep(4);
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      // Skip step 3 (education) for business users when going back
      if (step === 4 && form.userType === "business") {
        setStep(2);
      } else {
        setStep(step - 1);
      }
    }
  };

  return (
    <Container maxW="container.md" py={10} marginTop={"70px"}>
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
      {step === 0 && (
        <Box
          p="20px"
          border="1px solid"
          borderColor="gray.300"
          borderRadius="md"
          bg={"gray.50"}
        >
          <AccountStep
            form={form}
            setForm={setForm}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            showConfirmPassword={showConfirmPassword}
            setShowConfirmPassword={setShowConfirmPassword}
            otpSent={otpSent}
            handleSendOtp={handleSendOtp}
            otpLoading={otpLoading}
            handleChange={handleChange}
            resendTimer={resendTimer}
            handleResendOtp={handleResendOtp}
            handleNext={handleNext}
            loading={loading}
          />
        </Box>
      )}

      {step === 1 && (
        <BasicInfoStep
          form={form}
          setForm={setForm}
          handleChange={handleChange}
        />
      )}

      {step === 2 && <AddressStep form={form} handleChange={handleChange} />}

      {step === 3 && <EducationStep form={form} setForm={setForm} />}

      {step === 4 && (
        <LegalStep
          form={form}
          setForm={setForm}
          privacyPolicy={privacyPolicy}
        />
      )}

      <HStack mt={6} justify="space-between">
        <Button variant="outline" onClick={handleBack} isDisabled={step === 0}>
          Back
        </Button>
        <Button colorScheme="blue" onClick={handleNext} isLoading={loading}>
          {step === 0
            ? otpSent
              ? "Verify & Next"
              : "Next"
            : step === TOTAL_STEPS - 1
              ? "Finish"
              : "Next"}
        </Button>
      </HStack>
    </Container>
  );
}
