"use client";

import { signIn, useSession } from "next-auth/react";

import {
  Box,
  Button,
  Container,
  Divider,
  Heading,
  HStack,
  Progress,
  Stack,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import AccountStep from "@/app/components/onboarding/provider/AccountStep";
import BasicInfoStep from "@/app/components/onboarding/provider/BasicInfoStep";
import ContactStep from "@/app/components/onboarding/provider/ContactStep";
import ServiceStep from "@/app/components/onboarding/provider/ServiceStep";
import EducationStep from "@/app/components/onboarding/provider/EducationStep";
import LicenseStep from "@/app/components/onboarding/provider/LicenseStep";
import AvailabilityStep from "@/app/components/onboarding/provider/AvailabilityStep";
import PricingStep from "@/app/components/onboarding/provider/PricingStep";
import LegalStep from "@/app/components/onboarding/provider/LegalStep";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/* ================= CONFIG ================= */

const BASE_STEPS = 10;

/* ================= COMPONENT ================= */

export default function ProviderOnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const toast = useToast();

  const TOTAL_STEPS = 5; // Reduced to 5

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [privacyPolicy, setPrivacyPolicy] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  useEffect(() => {
    if (status === "authenticated") {
      setStep(1); // Start at Step 1 (Basic Info) if logged in
    }
  }, [status]);
  const [resendTimer, setResendTimer] = useState(0);
  const [accountErrors, setAccountErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });

  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  /* ================= DATA ================= */

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const [formData, setFormData] = useState({
    // STEP 0 – BUSINESS
    userType: "individual",

    firstName: "",
    lastName: "",

    businessName: "",
    businessType: "Company",
    registrationNumber: "",
    establishmentYear: "",
    gender: "",
    dateOfBirth: "",
    trnNumber: "",
    expiryDate: "",

    // STEP 1 – CONTACT
    city: "",
    zipCode: "",
    state: "",
    country: "",
    address: "",
    serviceRadius: "",
    serviceAreasInput: "",

    // STEP 2 – SERVICE
    categoryId: "",
    subCategoryId: "",
    servicesOfferedInput: "",
    description: "",
    yearsExperience: "",

    // STEP 3 – EDUCATION
    degree: "",
    institution: "",
    yearOfCompletion: "",

    // STEP 4 – CERTS
    licenseName: "",
    licenseAuth: "",
    licenseNumber: "",
    licenseExpiry: "",
    licenseDocument: null,

    // STEP 5 – AVAILABILITY
    availableDays: [],
    availableHoursStart: "",
    availableHoursEnd: "",
    emergency: false,

    // STEP 6 – PRICING
    pricingType: "hourly",
    baseRate: "",
    onSiteCharges: "",
    paymentMethods: [],

    // STEP 7 – IDENTITY
    idType: "",
    idNumber: "",
    backgroundCheckConsent: false,

    // STEP 8 – LEGAL
    termsAccepted: false,
    privacyAccepted: false,
    rulesAccepted: false,

    // STEP 9 – ACCOUNT
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });

  /* ================= EFFECTS ================= */
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

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!formData.categoryId) return;
    const cat = categories.find((c) => c.id === Number(formData.categoryId));
    setSubCategories(cat?.subCategories || []);
  }, [formData.categoryId, categories]);

  useEffect(() => {
    if (resendTimer === 0) return;
    const t = setInterval(() => setResendTimer((r) => r - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  // Fetch seeker profile and prefill form for authenticated users
  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchSeekerProfile = async () => {
      try {
        const res = await fetch("/api/seeker/profile");
        const data = await res.json();
        if (data.profile) {
          const p = data.profile;
          // Parse qualifications if it's a JSON array
          let educationData = {};
          if (
            p.qualifications &&
            Array.isArray(p.qualifications) &&
            p.qualifications.length > 0
          ) {
            const qual = p.qualifications[0];
            educationData = {
              degree: qual.qualification || qual.degree || "",
              institution: qual.institution || p.institution || "",
              yearOfCompletion: qual.year || p.year || "",
            };
          } else {
            educationData = {
              degree: "",
              institution: p.institution || "",
              yearOfCompletion: p.year || "",
            };
          }

          setFormData((prev) => ({
            ...prev,
            // User type
            userType: p.userType || prev.userType,
            // Individual fields
            firstName: p.firstName || "",
            lastName: p.lastName || "",
            idType: p.idType || "",
            idNumber: p.idNumber || "",
            backgroundCheckConsent: p.backgroundCheck || false,
            // Business fields
            businessName: p.businessName || "",
            businessType: p.businessType || "Company",
            registrationNumber: p.registrationNumber || "",
            establishmentYear: p.establishmentYear || "",
            trnNumber: p.trnNumber || "",
            expiryDate: p.businessExpiryDate || "",
            // Address fields
            city: p.city || "",
            zipCode: p.zipCode || "",
            state: p.state || "",
            country: p.country || "",
            address: p.address || "",
            // Education
            ...educationData,
          }));
        }
      } catch (err) {
        console.error("Failed to fetch seeker profile:", err);
      }
    };

    fetchSeekerProfile();
  }, [status]);

  /* ================= HELPERS ================= */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Fields that should only contain numbers
    const numericFields = [
      "zipCode",
      "serviceRadius",
      "establishmentYear",
      "registrationNumber",
      "trnNumber",
      "yearsExperience",
      "yearOfCompletion",
      "licenseNumber",
      "baseRate",
      "onSiteCharges",
      "otp",
    ];

    let finalValue = type === "checkbox" ? checked : value;

    if (numericFields.includes(name) && typeof finalValue === "string") {
      finalValue = finalValue.replace(/\D/g, "");
    }

    setFormData((p) => ({
      ...p,
      [name]: finalValue,
    }));
  };

  const handleArrayToggle = (key, value) => {
    setFormData((p) => ({
      ...p,
      [key]: p[key].includes(value)
        ? p[key].filter((v) => v !== value)
        : [...p[key], value],
    }));
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  /* ================= OTP ================= */
  const handleSendOtp = async () => {
    let hasError = false;
    const newErrors = { email: "", password: "", confirmPassword: "", otp: "" };

    if (!formData.email) {
      newErrors.email = "Email is required";
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
      hasError = true;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      hasError = true;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      hasError = true;
    }

    setAccountErrors(newErrors);
    if (hasError) return;

    setOtpLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setOtpSent(true);
      setResendTimer(60);

      toast({
        title: "OTP Sent",
        description: "Check your email inbox",
        status: "success",
      });
    } catch (err) {
      toast({ title: "Error", description: err.message, status: "error" });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = handleSendOtp;

  /*==================Validation ============*/

  const validateStep = () => {
    switch (step) {
      case 0:
        // Account Verification (Unauthenticated Only)
        if (status !== "authenticated") {
          const newErrors = {
            email: "",
            password: "",
            confirmPassword: "",
            otp: "",
          };
          let hasError = false;

          if (!formData.email) {
            newErrors.email = "Email is required";
            hasError = true;
          }
          if (!formData.password) {
            newErrors.password = "Password is required";
            hasError = true;
          }
          if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
            hasError = true;
          }
          if (otpSent && !formData.otp) {
            newErrors.otp = "Please enter OTP";
            hasError = true;
          }

          if (hasError) {
            setAccountErrors(newErrors);
            return "Please fix account errors";
          }
        }
        return null;

      case 1:
        // Profile Mega Step (Basic Info, Identity, Service, Pricing)
        if (formData.userType === "individual") {
          if (!formData.firstName || !formData.lastName) {
            return "Please enter first name and last name";
          }
          if (!formData.idType || !formData.idNumber) {
            return "Please enter ID type and ID number";
          }
          if (!formData.backgroundCheckConsent) {
            return "Please confirm background check consent";
          }
        } else {
          // business
          if (
            !formData.businessName ||
            !formData.businessType ||
            !formData.registrationNumber ||
            !formData.establishmentYear ||
            !formData.trnNumber
          ) {
            return "Please complete all business details";
          }
        }

        // Common for both in profile step
        if (
          !formData.categoryId ||
          !formData.subCategoryId ||
          !formData.description
        ) {
          return "Please complete service details";
        }
        if (!formData.servicesOfferedInput)
          return "Please add at least one service offered";

        if (!formData.yearsExperience) return "Years of experience is required";

        if (
          !formData.pricingType ||
          !formData.baseRate ||
          formData.paymentMethods.length === 0
        ) {
          return "Please complete pricing details";
        }

        return null;

      case 2:
        // Contact Details
        if (
          !formData.city ||
          !formData.zipCode ||
          !formData.state ||
          !formData.country ||
          !formData.address ||
          !formData.serviceRadius
        ) {
          return "Please fill all contact details";
        }
        return null;

      case 3:
        // Availability
        if (
          formData.availableDays.length === 0 ||
          !formData.availableHoursStart ||
          !formData.availableHoursEnd
        ) {
          return "Please set availability details";
        }
        return null;

      case 4:
        // Terms
        if (!formData.termsAccepted) {
          return "You must accept the terms and conditions";
        }
        return null;

      default:
        return null;
    }
  };

  /* ================= NEXT ================= */

  const handleNext = async () => {
    setLoading(true);

    try {
      const error = validateStep();
      if (error) {
        toast({
          title: "Validation Error",
          description: error,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // STEP 0 – Basic Signup (if unauthenticated)
      if (step === 0 && status !== "authenticated") {
        if (!otpSent) {
          await handleSendOtp();
          return;
        }

        // Verify OTP Only (Do not create account yet)
        const verifyPayload = {
          email: formData.email,
          otp: formData.otp,
        };

        const res = await fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(verifyPayload),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "OTP Verification failed");

        toast({ title: "Email Verified!", status: "success" });
        // Move to next step (Still unauthenticated)
        setStep(1);
        return;
      }

      /* ================= FINAL SUBMISSION ================= */
      if (step === TOTAL_STEPS - 1) {
        // 1. Payload Construction (Common Fields)
        const payload = {
          // User Info
          userType: formData.userType,
          firstName: formData.firstName,
          lastName: formData.lastName,
          // ... (email/pass only if not auth)

          // Business
          businessName: formData.businessName,
          businessType: formData.businessType,
          registrationNumber: formData.registrationNumber,
          establishmentYear: formData.establishmentYear,
          trnNumber: formData.trnNumber,
          expiryDate: formData.expiryDate,

          // Contact
          city: formData.city,
          zipCode: formData.zipCode,
          state: formData.state,
          country: formData.country,
          address: formData.address,
          serviceRadius: formData.serviceRadius,
          serviceAreas: formData.serviceAreasInput
            ? formData.serviceAreasInput.split(",").map((s) => s.trim())
            : [],

          // Service
          categoryId: formData.categoryId,
          subCategoryId: formData.subCategoryId,
          servicesOffered: formData.servicesOfferedInput
            ? formData.servicesOfferedInput.split(",").map((s) => s.trim())
            : [],
          description: formData.description,
          yearsExperience: formData.yearsExperience,

          // Education
          qualifications: formData.degree
            ? [
                {
                  degree: formData.degree,
                  institution: formData.institution,
                  year: formData.yearOfCompletion,
                },
              ]
            : [],

          // License
          licenses: formData.licenseName
            ? [
                {
                  name: formData.licenseName,
                  authority: formData.licenseAuth,
                  number: formData.licenseNumber,
                  expiry: formData.licenseExpiry,
                  document: formData.licenseDocument,
                },
              ]
            : [],

          // Availability
          availability: {
            days: formData.availableDays,
            hours: {
              start: formData.availableHoursStart,
              end: formData.availableHoursEnd,
            },
            emergency: formData.emergency,
          },

          // Pricing
          pricingType: formData.pricingType,
          baseRate: formData.baseRate,
          onSiteCharges: formData.onSiteCharges,
          paymentMethods: formData.paymentMethods,

          // Identity
          idType: formData.idType,
          idNumber: formData.idNumber,
          backgroundCheckConsent: formData.backgroundCheckConsent,

          // Legal
          termsAccepted: formData.termsAccepted,
          privacyAccepted: formData.privacyAccepted,
          rulesAccepted: formData.rulesAccepted,
        };

        // 2. Logic Split: UPGRADE vs SIGNUP
        // Since we force login at Step 0, we can assume authenticated flow here mostly.
        // However, to be safe, we check session.

        if (status === "authenticated") {
          // --- UPGRADE FLOW ---
          const res = await fetch("/api/provider/upgrade-request", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          const result = await res.json();
          if (!res.ok)
            throw new Error(result.message || "Failed to submit request");

          toast({
            title: "Request Submitted!",
            description: "Admin will review your request.",
            status: "success",
          });
          router.push("/providerDashboard");
          return;
        } else {
          // --- SIGNUP FLOW (New Provider) ---
          // Append Account Data to Payload
          payload.email = formData.email;
          payload.password = formData.password;
          payload.otp = formData.otp;

          const res = await fetch("/api/auth/signup-provider", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          const result = await res.json();
          if (!res.ok)
            throw new Error(result.message || "Failed to create account");

          // Login
          const signInRes = await signIn("credentials", {
            redirect: false,
            email: formData.email,
            password: formData.password,
          });

          if (signInRes?.error) {
            throw new Error(
              "Account created but failed to login automatically",
            );
          }

          toast({ title: "Registration Successful!", status: "success" });
          router.push("/providerDashboard");
          return;
        }
      }

      // Move to next step if not final
      setStep((prev) => prev + 1);
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <Container maxW="container.xl" marginTop={"70px"}>
      <VStack
        bg="white"
        p={8}
        spacing={3}
        borderRadius="lg"
        boxShadow="md"
        position="relative"
      >
        <Heading size="lg" color="gray.600">
          Provider Registration
        </Heading>

        <Box w="100%">
          <Box
            position="fixed"
            top="71px"
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
              colorScheme="green"
              borderRadius="md"
            />
          </Box>

          <Text
            fontSize="sm"
            mt={1}
            textAlign="right"
            position="absolute"
            top="50px"
            right="20px"
          >
            Step {step + 1} of {TOTAL_STEPS}
          </Text>
        </Box>

        <Divider />

        {/* STEPS */}
        {step === 0 && (
          <AccountStep
            formData={formData}
            handleChange={handleChange}
            status={status}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            showConfirmPassword={showConfirmPassword}
            setShowConfirmPassword={setShowConfirmPassword}
            otpSent={otpSent}
            handleSendOtp={handleSendOtp}
            otpLoading={otpLoading}
            resendTimer={resendTimer}
            handleResendOtp={handleResendOtp}
            accountErrors={accountErrors}
            setAccountErrors={setAccountErrors}
          />
        )}

        {step === 1 && (
          <BasicInfoStep
            formData={formData}
            handleChange={handleChange}
            setFormData={setFormData}
            handleArrayToggle={handleArrayToggle}
            categories={categories}
            subCategories={subCategories}
          />
        )}

        {step === 2 && (
          <ContactStep
            formData={formData}
            handleChange={handleChange}
            setFormData={setFormData}
          />
        )}

        {step === 3 && (
          <AvailabilityStep
            formData={formData}
            handleChange={handleChange}
            setFormData={setFormData}
            handleArrayToggle={handleArrayToggle}
          />
        )}

        {step === 4 && (
          <LegalStep
            formData={formData}
            setFormData={setFormData}
            privacyPolicy={privacyPolicy}
          />
        )}

        <HStack w="100%" justify="space-around">
          <Button
            variant="outline"
            onClick={handleBack}
            isDisabled={step === 0}
          >
            Back
          </Button>
          <Button colorScheme="blue" onClick={handleNext} isLoading={loading}>
            {step === TOTAL_STEPS - 1 ? "Finish" : "Next"}
          </Button>
        </HStack>
      </VStack>
    </Container>
  );
}
