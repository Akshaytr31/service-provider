"use client";

import { signIn } from "next-auth/react";

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
  InputGroup,
  InputRightElement,
  IconButton,
  Flex,
  RadioGroup,
  Radio,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const TOTAL_STEPS = 5;

export default function SeekerOnboarding() {
  const router = useRouter();
  const toast = useToast();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

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
          JSON.stringify(payload, null, 2)
        );

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
      setStep(4); // Skip education, go to terms
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      // Skip step 3 (education) for business users when going back
      if (step === 4 && form.userType === "business") {
        setStep(2); // Skip education, go back to address
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
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
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
      )}

      {/* STEP 0 */}
      {step === 1 && (
        <Stack spacing={4} alignItems={"center"} width="full">
          <Heading size="md" color="gray.600">
            Basic Details & Select type
          </Heading>

          <RadioGroup
            value={form.userType}
            onChange={(val) => setForm((p) => ({ ...p, userType: val }))}
          >
            <HStack>
              <Radio value="individual">Individual</Radio>
              <Radio value="business">Business</Radio>
            </HStack>
          </RadioGroup>

          {/* INDIVIDUAL FIELDS */}
          {form.userType === "individual" && (
            <Box w="full">
              <FormControl isRequired>
                <FormLabel fontSize="sm">First Name</FormLabel>
                <Input
                  name="firstName"
                  placeholder="First Name"
                  value={form.firstName}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm">Last Name</FormLabel>
                <Input
                  name="lastName"
                  placeholder="Last Name"
                  value={form.lastName}
                  onChange={handleChange}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="sm">Document Type</FormLabel>
                <Select
                  name="idType"
                  value={form.idType}
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
                  inputMode={form.idType === "Passport" ? "text" : "numeric"}
                  pattern={form.idType === "Passport" ? undefined : "[0-9]*"}
                  placeholder={
                    form.idType === "Passport"
                      ? "Passport Number (A1234567)"
                      : "ID Number"
                  }
                  value={form.idNumber}
                  onChange={(e) => {
                    const { value } = e.target;
                    const finalValue =
                      form.idType === "Passport"
                        ? value
                        : value.replace(/\D/g, "");
                    setForm((p) => ({ ...p, idNumber: finalValue }));
                  }}
                />
              </FormControl>

              {/* BACKGROUND CHECK */}
              <FormControl>
                <Checkbox
                  isChecked={form.backgroundCheckConsent}
                  onChange={(e) =>
                    setForm((p) => ({
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
          {form.userType === "business" && (
            <Stack spacing={4} width={"full"}>
              <FormControl isRequired>
                <FormLabel fontSize="sm">Business Name</FormLabel>
                <Input
                  name="businessName"
                  placeholder="Business Name"
                  value={form.businessName}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm">Business Type</FormLabel>
                <Select
                  name="businessType"
                  value={form.businessType}
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
                  value={form.registrationNumber}
                  onChange={handleChange}
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm">Establishment Year</FormLabel>
                <Input
                  name="establishmentYear"
                  placeholder="Establishment Year"
                  value={form.establishmentYear}
                  onChange={handleChange}
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="sm">TRN Number</FormLabel>
                <Input
                  name="trnNumber"
                  placeholder="TRN Number"
                  value={form.trnNumber}
                  onChange={handleChange}
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="sm">Expiry Date</FormLabel>
                <Input
                  name="expiryDate"
                  type="date"
                  placeholder="Expiry Date"
                  value={form.expiryDate}
                  onChange={handleChange}
                />
              </FormControl>
            </Stack>
          )}
        </Stack>
      )}

      {step === 2 && (
        <Stack spacing={4}>
          <HStack>
            <FormControl isRequired>
              <FormLabel fontSize="sm">City</FormLabel>
              <Input
                name="city"
                placeholder="City"
                value={form.city}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm">Zip Code</FormLabel>
              <Input
                name="zipCode"
                placeholder="Zip Code"
                value={form.zipCode}
                onChange={handleChange}
                inputMode="numeric"
                pattern="[0-9]*"
              />
            </FormControl>
          </HStack>

          <FormControl isRequired>
            <FormLabel fontSize="sm">State/Emirates/Governorate</FormLabel>
            <Input
              name="state"
              placeholder="State"
              value={form.state}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel fontSize="sm">Country</FormLabel>
            <Input
              name="country"
              placeholder="Country"
              value={form.country}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel fontSize="sm">Full Address</FormLabel>
            <Textarea
              name="address"
              placeholder="Full Address"
              value={form.address}
              onChange={handleChange}
            />
          </FormControl>
        </Stack>
      )}

      {/* STEP 1 */}
      {step === 3 && (
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
                  education: {
                    ...form.education,
                    year: e.target.value.replace(/\D/g, ""),
                  },
                })
              }
              inputMode="numeric"
              pattern="[0-9]*"
            />
          </FormControl>
        </Stack>
      )}

      {/* STEP 2 */}
      {step === 4 && (
        <Stack spacing={4}>
          <Heading size="sm">Privacy Policy</Heading>
          <Box
            p={4}
            borderWidth="1px"
            borderRadius="md"
            maxH="300px"
            overflowY="auto"
            bg="gray.800"
            color="white"
          >
            <Text whiteSpace="pre-wrap" fontSize="sm">
              {privacyPolicy || "Loading privacy policy..."}
            </Text>
          </Box>
          <Checkbox
            isChecked={form.termsAccepted}
            onChange={(e) =>
              setForm({ ...form, termsAccepted: e.target.checked })
            }
          >
            I agree to Terms & Conditions *
          </Checkbox>
        </Stack>
      )}

      {/* STEP 3 */}

      <HStack mt={6} justify="space-between">
        <Button variant="outline" onClick={handleBack} isDisabled={step === 0}>
          Back
        </Button>
        <Button colorScheme="blue" onClick={handleNext} isLoading={loading}>
          {step === 0
            ? otpSent
              ? "Verify & Next"
              : "Send OTP"
            : step === TOTAL_STEPS - 1
            ? "Finish"
            : "Next"}
        </Button>
      </HStack>
    </Container>
  );
}
