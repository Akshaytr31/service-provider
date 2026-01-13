"use client";

import { signIn, useSession } from "next-auth/react";

import {
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  Heading,
  HStack,
  Input,
  Progress,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  Textarea,
  useToast,
  VStack,
  FormControl,
  FormLabel,
  Card,
  InputGroup,
  InputRightElement,
  IconButton,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/* ================= CONFIG ================= */

/* ================= CONFIG ================= */

const BASE_STEPS = 10;

/* ================= COMPONENT ================= */

export default function ProviderOnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const toast = useToast();

  const TOTAL_STEPS = 9; // Reduced to 9

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  useEffect(() => {
    if (status === "authenticated") {
      setStep(1); // Start at Step 1 (Basic Info) if logged in
    }
  }, [status]);
  const [resendTimer, setResendTimer] = useState(0);

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

  /* ================= HELPERS ================= */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
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
  if (step === 5 && formData.userType === "business") {
    setStep(3);
  } else if (step > 0) {
    setStep(step - 1);
  }
  };

  /* ================= OTP ================= */
  const handleSendOtp = async () => {
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
          if (
            !formData.email ||
            !formData.password ||
            !formData.confirmPassword
          ) {
            return "Please enter email and password";
          }
          if (formData.password !== formData.confirmPassword) {
            return "Passwords do not match";
          }
          if (otpSent && !formData.otp) {
            return "Please enter OTP";
          }
        }
        return null;

      case 1:
        // Basic Info - New Step 1
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
        }

        if (formData.userType === "business") {
          if (
            !formData.businessName ||
            !formData.businessType ||
            !formData.registrationNumber ||
            !formData.establishmentYear ||
            !formData.trnNumber ||
            !formData.expiryDate
          ) {
            return "Please complete all business details";
          }
        }
        return null;

      case 2:
        // Contact Details - Was Step 1
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
        // Service Category - Was Step 2
        if (
          !formData.categoryId ||
          !formData.subCategoryId ||
          !formData.description
        ) {
          return "Please complete service details";
        }
        // Basic service check
        if (!formData.servicesOfferedInput)
          return "Please add at least one service offered";

        return null;

      case 4:
        // Education - Was Step 3
        if (formData.userType === "individual") {
          // Optional validation if fields are partially filled?
          // Keeping it loose for now as originally required
          if (
            formData.degree &&
            (!formData.institution || !formData.yearOfCompletion)
          ) {
            return "Please complete education details";
          }
        }
        return null;

      case 5:
        // Experience / Licenses - Was Step 4
        // Original logic: required certain fields
        /* 
          !formData.licenseName || !formData.licenseAuth ... 
          Actually user disabled strict checks previously?
          Let's verify existing logic.
          Original Step 4 checked license details if present or strictly?
          Looking at previous code: it checked license details. 
        */
        if (!formData.yearsExperience) return "Years of experience is required";
        // License logic: If user enters name, enforce others?
        if (formData.licenseName) {
          if (
            !formData.licenseAuth ||
            !formData.licenseNumber ||
            !formData.licenseExpiry
          )
            return "Complete license details";
        }
        return null;

      case 6:
        // Availability - Was Step 5
        if (
          formData.availableDays.length === 0 ||
          !formData.availableHoursStart ||
          !formData.availableHoursEnd
        ) {
          return "Please set availability details";
        }
        return null;

      case 7:
        // Pricing - Was Step 6
        if (
          !formData.pricingType ||
          !formData.baseRate ||
          formData.paymentMethods.length === 0
        ) {
          return "Please complete pricing details";
        }
        return null;

      case 8:
        // Terms - Was Step 9
        if (
          !formData.termsAccepted ||
          !formData.privacyAccepted ||
          !formData.rulesAccepted
        ) {
          return "You must accept all legal agreements";
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
              "Account created but failed to login automatically"
            );
          }

          toast({ title: "Registration Successful!", status: "success" });
          router.push("/providerDashboard");
          return;
        }
      }

      // Move to next step if not final
      if (step === 3 && formData.userType === "business") {
        setStep(5);
      } else {
        setStep((prev) => prev + 1);
      }
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
    <Container maxW="container.sm" py={10} marginTop={"70px"}>
      <VStack bg="white" p={8} spacing={6} borderRadius="lg" boxShadow="md">
        <Heading size="lg" color="gray.600">
          Provider Registration
        </Heading>

        <Box w="100%">
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

          <Text fontSize="sm" mt={1} textAlign="right">
            Step {step + 1} of {TOTAL_STEPS}
          </Text>
        </Box>

        <Divider />

        {/* STEP 0 - Account Setup */}
        {step === 0 && (
          <Stack spacing={4} alignItems={"center"}>
            {/* ACCOUNT FIELDS (Unauthenticated Only) */}
            {status !== "authenticated" ? (
              <Stack spacing={4} w="full" pb={4}>
                <Heading size="md" color="gray.600">
                  Account Setup
                </Heading>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">Email</FormLabel>
                  <Input
                    name="email"
                    type="email"
                    placeholder="Email Address"
                    onChange={handleChange}
                    value={formData.email}
                  />
                </FormControl>

                <Stack direction="row" spacing={4}>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm">Password</FormLabel>
                    <InputGroup>
                      <Input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        onChange={handleChange}
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
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontSize="sm">Confirm Password</FormLabel>
                    <InputGroup>
                      <Input
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm Password"
                        onChange={handleChange}
                        value={formData.confirmPassword}
                      />
                      <InputRightElement>
                        <IconButton
                          size="sm"
                          variant="ghost"
                          icon={
                            showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />
                          }
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>
                </Stack>

                {/* OTP LOGIC */}
                {!otpSent ? (
                  <Button
                    onClick={handleSendOtp}
                    isLoading={otpLoading}
                    variant="outline"
                    colorScheme="blue"
                    width="full"
                  >
                    Send OTP to Verify Email
                  </Button>
                ) : (
                  <Stack spacing={2} bg="blue.50" p={3} borderRadius="md">
                    <FormControl isRequired>
                      <FormLabel fontSize="sm" fontWeight="bold">
                        Enter OTP sent to {formData.email}
                      </FormLabel>
                      <HStack>
                        <Input
                          name="otp"
                          placeholder="######"
                          value={formData.otp}
                          onChange={handleChange}
                          maxLength={6}
                          textAlign="center"
                          letterSpacing={2}
                          bg="white"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleResendOtp}
                          isDisabled={resendTimer > 0}
                          color="blue.500"
                        >
                          {resendTimer > 0
                            ? `Resend (${resendTimer})`
                            : "Resend"}
                        </Button>
                      </HStack>
                    </FormControl>
                  </Stack>
                )}
              </Stack>
            ) : (
              <Text>You are already logged in. Click Next to proceed.</Text>
            )}
          </Stack>
        )}

        {/* STEP 1 - Basic Info (User Type / Name) */}
        {step === 1 && (
          <Stack spacing={4} alignItems={"center"} width="full">
            <Heading size="md" color="gray.600">
              Basic Details & Select type
            </Heading>

            <RadioGroup
              value={formData.userType}
              onChange={(val) => setFormData((p) => ({ ...p, userType: val }))}
            >
              <HStack>
                <Radio value="individual">Individual</Radio>
                <Radio value="business">Business</Radio>
              </HStack>
            </RadioGroup>

            {/* INDIVIDUAL FIELDS */}
            {formData.userType === "individual" && (
              <Box w="full">
                <FormControl isRequired>
                  <FormLabel fontSize="sm">First Name</FormLabel>
                  <Input
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">Last Name</FormLabel>
                  <Input
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Document Type</FormLabel>
                  <Select
                    name="idType"
                    value={formData.idType}
                    onChange={handleChange}
                  >
                    <option value="" disabled>
                      Select Document
                    </option>
                    <option value="Passport">Passport</option>
                    <option value="Driving License">Driving License</option>
                    <option value="National ID">National ID</option>
                  </Select>
                </FormControl>

                {/* ID NUMBER */}
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Document Number</FormLabel>
                  <Input
                    name="idNumber"
                    type="text"
                    inputMode={
                      formData.idType === "Passport" ? "text" : "numeric"
                    }
                    placeholder={
                      formData.idType === "Passport"
                        ? "Passport Number (A1234567)"
                        : "ID Number"
                    }
                    value={formData.idNumber}
                    onChange={handleChange}
                  />
                </FormControl>

                {/* BACKGROUND CHECK */}
                <FormControl>
                  <Checkbox
                    isChecked={formData.backgroundCheckConsent}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        backgroundCheckConsent: e.target.checked,
                      }))
                    }
                  >
                    I consent to background check
                  </Checkbox>
                </FormControl>
              </Box>
            )}

            {/* BUSINESS FIELDS */}
            {formData.userType === "business" && (
              <Stack spacing={4} width={"full"}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Business Name</FormLabel>
                  <Input
                    name="businessName"
                    placeholder="Business Name"
                    value={formData.businessName}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">Business Type</FormLabel>
                  <Select
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleChange}
                  >
                    <option value="Company">Company</option>
                    <option value="Agency">Agency</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">Registration Number</FormLabel>
                  <Input
                    name="registrationNumber"
                    placeholder="Registration Number"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">Establishment Year</FormLabel>
                  <Input
                    name="establishmentYear"
                    placeholder="Establishment Year"
                    value={formData.establishmentYear}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize="sm">TRN Number</FormLabel>
                  <Input
                    name="trnNumber"
                    placeholder="TRN Number"
                    value={formData.trnNumber}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Expiry Date</FormLabel>
                  <Input
                    name="expiryDate"
                    type="date"
                    placeholder="Expiry Date"
                    value={formData.expiryDate}
                    onChange={handleChange}
                  />
                </FormControl>
              </Stack>
            )}
          </Stack>
        )}

        {/* STEP 1 */}
        {step === 2 && (
          <Stack spacing={4}>
            <HStack>
              <FormControl isRequired>
                <FormLabel fontSize="sm">City</FormLabel>
                <Input name="city" placeholder="City" onChange={handleChange} />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm">Zip Code</FormLabel>
                <Input
                  name="zipCode"
                  placeholder="Zip Code"
                  onChange={handleChange}
                />
              </FormControl>
            </HStack>

            <FormControl isRequired>
              <FormLabel fontSize="sm">State/Emirates/Governorate</FormLabel>
              <Input name="state" placeholder="State" onChange={handleChange} />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm">Country</FormLabel>
              <Input
                name="country"
                placeholder="Country"
                onChange={handleChange}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm">Full Address</FormLabel>
              <Textarea
                name="address"
                placeholder="Full Address"
                onChange={handleChange}
              />
            </FormControl>

            <FormControl isRequired>
              <Card
                padding={"20px"}
                border={"1px solid #e2e8f0"}
                boxShadow={"none"}
              >
                <FormLabel fontSize="sm">
                  Service Radius (km): {formData.serviceRadius || 0}
                </FormLabel>

                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={Number(formData.serviceRadius) || 0}
                  onChange={(val) =>
                    setFormData((prev) => ({
                      ...prev,
                      serviceRadius: val,
                    }))
                  }
                >
                  {/* Optional marks */}
                  <SliderMark value={0} mt="2" ml="-2" fontSize="xs">
                    0
                  </SliderMark>
                  <SliderMark value={50} mt="2" ml="-2" fontSize="xs">
                    50
                  </SliderMark>
                  <SliderMark value={100} mt="2" ml="-4" fontSize="xs">
                    100
                  </SliderMark>

                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>

                  <SliderThumb boxSize={6} backgroundColor="blue.500">
                    <Box color="white" fontSize="10px">
                      KM
                    </Box>
                  </SliderThumb>
                </Slider>
              </Card>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">Service Locality</FormLabel>
              <Textarea
                name="serviceLocality"
                placeholder="Service Locality"
                onChange={handleChange}
              />
            </FormControl>
          </Stack>
        )}

        {step === 3 && (
          <Stack spacing={4} width={"full"}>
            <Heading size="sm">Service Details</Heading>

            {/* CATEGORY */}
            <FormControl isRequired width={"full"}>
              <FormLabel fontSize="sm">Category</FormLabel>
              <Select
                name="categoryId"
                value={formData.categoryId}
                onChange={(e) => {
                  handleChange(e);
                  setFormData((prev) => ({
                    ...prev,
                    subCategoryId: "",
                  }));
                }}
              >
                <option value="" disabled>
                  Select Category
                </option>

                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            {/* SUB CATEGORY */}
            <FormControl isRequired isDisabled={!formData.categoryId}>
              <FormLabel fontSize="sm">Sub Category</FormLabel>
              <Select
                name="subCategoryId"
                value={formData.subCategoryId}
                onChange={handleChange}
              >
                <option value="" disabled>
                  {formData.categoryId
                    ? "Select Sub Category"
                    : "Select Category first"}
                </option>

                {subCategories.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            {/* SERVICES OFFERED */}
            <FormControl>
              <FormLabel fontSize="sm">Services Offered</FormLabel>
              <Textarea
                name="servicesOfferedInput"
                placeholder="Services Offered (comma separated)"
                onChange={handleChange}
              />
            </FormControl>

            {/* DESCRIPTION */}
            <FormControl isRequired>
              <FormLabel fontSize="sm">Service Description</FormLabel>
              <Textarea
                name="description"
                placeholder="Describe your service"
                onChange={handleChange}
              />
            </FormControl>

            {/* EXPERIENCE */}
            <FormControl isRequired>
              <FormLabel fontSize="sm">Years of Experience</FormLabel>
              <Input
                name="yearsExperience"
                placeholder="Years of Experience"
                onChange={handleChange}
              />
            </FormControl>
          </Stack>
        )}

        {/* STEP 4 - Education */}
        {step === 4 && formData.userType === "individual" && (
          <Stack spacing={4} width={"full"}>
            <Heading size="sm">Qualification</Heading>

            <FormControl isRequired width={"full"}>
              <FormLabel fontSize="sm" >Qualification</FormLabel>
              <Input
                name="degree"
                placeholder="Qualification"
                value={formData.degree}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm">Institution</FormLabel>
              <Input
                name="institution"
                placeholder="Institution"
                value={formData.institution}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm">Year of Completion</FormLabel>
              <Input
                name="yearOfCompletion"
                placeholder="Year of Completion"
                value={formData.yearOfCompletion}
                onChange={handleChange}
              />
            </FormControl>
          </Stack>
        )}

        {step === 5 && (
          <Stack spacing={4} width={"full"}>
            <Heading size="sm">License</Heading>

            <FormControl isRequired width={"full"}>
              <FormLabel fontSize="sm">License Name</FormLabel>
              <Input
                name="licenseName"
                placeholder="License Name"
                value={formData.licenseName}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm">Issuing Authority</FormLabel>
              <Input
                name="licenseAuth"
                placeholder="Issuing Authority"
                value={formData.licenseAuth}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm">License Number</FormLabel>
              <Input
                name="licenseNumber"
                placeholder="License Number"
                value={formData.licenseNumber}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm">License Expiry Date</FormLabel>
              <Input
                name="licenseExpiry"
                type="date"
                value={formData.licenseExpiry}
                onChange={handleChange}
              />
            </FormControl>
          </Stack>
        )}

        {step === 6 && (
          <Stack spacing={4}>
            <Heading size="sm">Working days and time</Heading>

            {/* Working Days */}
            <FormControl isRequired>
              <FormLabel fontSize="sm">Available Days</FormLabel>
              <HStack wrap="wrap">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                  (day) => (
                    <Checkbox
                      key={day}
                      isChecked={formData.availableDays.includes(day)}
                      onChange={() => handleArrayToggle("availableDays", day)}
                    >
                      {day}
                    </Checkbox>
                  )
                )}
              </HStack>
            </FormControl>

            {/* Working Hours */}
            <FormControl isRequired>
              <FormLabel fontSize="sm">Working Hours</FormLabel>
              <HStack>
                <Input
                  type="time"
                  name="availableHoursStart"
                  value={formData.availableHoursStart}
                  onChange={handleChange}
                />
                <Input
                  type="time"
                  name="availableHoursEnd"
                  value={formData.availableHoursEnd}
                  onChange={handleChange}
                />
              </HStack>
            </FormControl>

            {/* Emergency Availability */}
            <FormControl>
              <Checkbox
                isChecked={formData.emergency}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, emergency: e.target.checked }))
                }
              >
                Emergency / After-hours available
              </Checkbox>
            </FormControl>
          </Stack>
        )}

        {step === 7 && (
          <Stack spacing={4}>
            <Heading size="sm">Fix your price</Heading>

            {/* Pricing Type */}
            <FormControl isRequired>
              <FormLabel fontSize="sm">Pricing Type</FormLabel>
              <Select
                name="pricingType"
                value={formData.pricingType}
                onChange={handleChange}
              >
                <option value="hourly">Hourly</option>
                <option value="fixed">Fixed</option>
                <option value="project">Per Project</option>
              </Select>
            </FormControl>

            {/* Base Rate */}
            <FormControl isRequired>
              <FormLabel fontSize="sm">Base Rate</FormLabel>
              <Input
                name="baseRate"
                placeholder="Enter base rate"
                value={formData.baseRate}
                onChange={handleChange}
              />
            </FormControl>

            {/* Payment Methods */}
            <FormControl isRequired>
              <FormLabel fontSize="sm">Payment Methods</FormLabel>
              <HStack spacing={4}>
                {["Bank", "App"].map((p) => (
                  <Checkbox
                    key={p}
                    isChecked={formData.paymentMethods.includes(p)}
                    onChange={() => handleArrayToggle("paymentMethods", p)}
                  >
                    {p}
                  </Checkbox>
                ))}
              </HStack>
            </FormControl>
          </Stack>
        )}

        {step === 8 && (
          <Stack spacing={4}>
            <Checkbox
              isChecked={formData.termsAccepted}
              onChange={(e) =>
                setFormData((p) => ({ ...p, termsAccepted: e.target.checked }))
              }
            >
              Accept Terms & Conditions
            </Checkbox>

            <Checkbox
              isChecked={formData.privacyAccepted}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  privacyAccepted: e.target.checked,
                }))
              }
            >
              Accept Privacy Policy
            </Checkbox>

            <Checkbox
              isChecked={formData.rulesAccepted}
              onChange={(e) =>
                setFormData((p) => ({ ...p, rulesAccepted: e.target.checked }))
              }
            >
              Agree to Platform Rules
            </Checkbox>
          </Stack>
        )}

        {/* STEP 9 - REMOVED MERGED INTO STEP 0 */}

        <HStack w="100%" justify="space-between">
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
