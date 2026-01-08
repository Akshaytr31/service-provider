"use client";

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
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/* ================= CONFIG ================= */

const TOTAL_STEPS = 10;

/* ================= COMPONENT ================= */

export default function ProviderOnboardingPage() {
  const router = useRouter();
  const toast = useToast();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  /* ================= DATA ================= */

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const [formData, setFormData] = useState({
    // STEP 0 – BUSINESS
    userType: "individual",
    businessName: "",
    businessType: "Company",
    registrationNumber: "",
    establishmentYear: "",
    gender: "",
    dateOfBirth: "",

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

    // STEP 9 – OTP
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
    if (step > 0) setStep(step - 1);
  };

  /* ================= OTP ================= */
  const handleSendOtp = async () => {
    setOtpLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        if (
          !formData.userType ||
          (formData.userType === "business" &&
            (!formData.businessName ||
              !formData.businessType ||
              !formData.registrationNumber ||
              !formData.establishmentYear))
        ) {
          return "Please complete all business details";
        }
        return null;

      case 1:
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

      case 2:
        if (
          !formData.categoryId ||
          !formData.subCategoryId ||
          !formData.description ||
          !formData.yearsExperience
        ) {
          return "Please complete service details";
        }
        return null;

      case 3:
        if (
          !formData.degree ||
          !formData.institution ||
          !formData.yearOfCompletion
        ) {
          return "Please complete education details";
        }
        return null;

      case 4:
        if (
          !formData.licenseName ||
          !formData.licenseAuth ||
          !formData.licenseNumber ||
          !formData.licenseExpiry
        ) {
          return "Please complete certification details";
        }
        return null;

      case 5:
        if (
          formData.availableDays.length === 0 ||
          !formData.availableHoursStart ||
          !formData.availableHoursEnd
        ) {
          return "Please set availability details";
        }
        return null;

      case 6:
        if (
          !formData.pricingType ||
          !formData.baseRate ||
          !formData.onSiteCharges ||
          formData.paymentMethods.length === 0
        ) {
          return "Please complete pricing details";
        }
        return null;

      case 7: {
        if (!formData.idType || !formData.idNumber) {
          return "Please provide identity verification details";
        }

        if (formData.idType === "Passport") {
          const passportRegex = /^[A-Z0-9]{6,9}$/i;
          if (!passportRegex.test(formData.idNumber)) {
            return "Invalid passport number format";
          }
        }

        if (
          formData.idType !== "Passport" &&
          !/^[0-9]{6,20}$/.test(formData.idNumber)
        ) {
          return "Invalid ID number";
        }

        return null;
      }

      case 8:
        if (
          !formData.termsAccepted ||
          !formData.privacyAccepted ||
          !formData.rulesAccepted
        ) {
          return "You must accept all legal agreements";
        }
        return null;

      case 9:
        if (!formData.otp.trim()) {
          return "OTP is required";
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

      /* ================= STEP 0: SET ROLE ================= */
      if (step === 0) {
        const roleRes = await fetch("/api/auth/update-role", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: "provider" }),
        });

        if (!roleRes.ok) {
          throw new Error("Failed to set provider role");
        }
      }

      /* ================= STEP 8: LEGAL VALIDATION ================= */
      if (step === 8) {
        if (
          !formData.termsAccepted ||
          !formData.privacyAccepted ||
          !formData.rulesAccepted
        ) {
          throw new Error("You must accept all legal terms");
        }
      }

      /* ================= BUILD STEP-SPECIFIC PAYLOAD ================= */
      let payload = {};

      // STEP 0 – Business
      if (step === 0) {
        payload = {
          userType: formData.userType,
          businessName: formData.businessName,
          businessType: formData.businessType,
          registrationNumber: formData.registrationNumber,
          establishmentYear: formData.establishmentYear,
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth,
        };
      }

      // STEP 1 – Contact
      if (step === 1) {
        payload = {
          city: formData.city,
          zipCode: formData.zipCode,
          state: formData.state,
          country: formData.country,
          address: formData.address,
          serviceRadius: formData.serviceRadius
            ? parseInt(formData.serviceRadius)
            : null,
          serviceAreas: formData.serviceAreasInput
            ? formData.serviceAreasInput.split(",").map((s) => s.trim())
            : [],
        };
      }

      // STEP 2 – Service
      if (step === 2) {
        payload = {
          categoryId: Number(formData.categoryId),
          subCategoryId: Number(formData.subCategoryId),
          servicesOffered: formData.servicesOfferedInput
            ? formData.servicesOfferedInput.split(",").map((s) => s.trim())
            : [],
          description: formData.description,
          yearsExperience: formData.yearsExperience,
        };
      }

      // STEP 3 – Education
      if (step === 3) {
        payload = {
          qualifications: formData.degree
            ? [
                {
                  degree: formData.degree,
                  institution: formData.institution,
                  year: formData.yearOfCompletion,
                },
              ]
            : [],
        };
      }

      // STEP 4 – Certifications
      if (step === 4) {
        payload = {
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
        };
      }

      // STEP 5 – Availability
      if (step === 5) {
        payload = {
          availability: {
            days: formData.availableDays,
            hours: {
              start: formData.availableHoursStart,
              end: formData.availableHoursEnd,
            },
            emergency: formData.emergency,
          },
        };
      }

      // STEP 6 – Pricing
      if (step === 6) {
        payload = {
          pricingType: formData.pricingType,
          baseRate: formData.baseRate,
          onSiteCharges: formData.onSiteCharges,
          paymentMethods: formData.paymentMethods,
        };
      }

      // STEP 7 – Identity
      if (step === 7) {
        payload = {
          idType: formData.idType,
          idNumber: formData.idNumber,
          backgroundCheckConsent: formData.backgroundCheckConsent,
        };
      }

      // STEP 8 – Legal
      if (step === 8) {
        payload = {
          termsAccepted: formData.termsAccepted,
          privacyAccepted: formData.privacyAccepted,
          rulesAccepted: formData.rulesAccepted,
        };
      }

      // 🔐 OTP VALIDATION — ONLY AT FINAL STEP
      if (step === 9 && !formData.otp.trim()) {
        throw new Error("OTP is required");
      }

      if (step === 9) {
        payload = {
          otp: formData.otp.trim(),
        };
      }

      /* ================= SAVE CURRENT STEP ================= */
      const res = await fetch("/api/provider/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step, data: payload }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to save step");

      /* ================= MOVE NEXT ================= */
      if (step < TOTAL_STEPS - 1) {
        setStep((s) => s + 1);
      } else {
        toast({ title: "Onboarding Completed", status: "success" });
        router.push("/providerDashboard");
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
    <Container maxW="container.sm" py={10}>
      <VStack bg="white" p={8} spacing={6} borderRadius="lg" boxShadow="md">
        <Heading size="md">Provider Registration</Heading>

        <Box w="100%">
          <Progress value={progress} colorScheme="blue" />
          <Text fontSize="sm" mt={1} textAlign="right">
            Step {step + 1} of {TOTAL_STEPS}
          </Text>
        </Box>

        <Divider />

        {/* STEP 0 */}
        {step === 0 && (
          <Stack>
            <Text fontWeight="bold">I am a:</Text>
            <RadioGroup
              value={formData.userType}
              onChange={(val) => setFormData((p) => ({ ...p, userType: val }))}
            >
              <HStack>
                <Radio value="individual">Individual</Radio>
                <Radio value="business">Business</Radio>
              </HStack>
            </RadioGroup>

            {formData.userType === "business" && (
              <>
                <Input
                  name="businessName"
                  placeholder="Business Name"
                  onChange={handleChange}
                />
                <Select
                  name="businessType"
                  onChange={handleChange}
                  value={formData.businessType}
                >
                  <option value="Company">Company</option>
                  <option value="Agency">Agency</option>
                </Select>
                <Input
                  name="registrationNumber"
                  placeholder="Registration Number"
                  onChange={handleChange}
                />
                <Input
                  name="establishmentYear"
                  placeholder="Establishment Year"
                  onChange={handleChange}
                />
              </>
            )}
          </Stack>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <Stack spacing={4}>
            <HStack>
              <Input name="city" placeholder="City" onChange={handleChange} />
              <Input
                name="zipCode"
                placeholder="Zip Code"
                onChange={handleChange}
              />
            </HStack>
            <Input name="state" placeholder="State" onChange={handleChange} />
            <Input
              name="country"
              placeholder="Country"
              onChange={handleChange}
            />
            <Textarea
              name="address"
              placeholder="Full Address"
              onChange={handleChange}
            />
            <Input
              name="serviceRadius"
              placeholder="Service Radius (km)"
              onChange={handleChange}
            />
            <Textarea
              name="serviceAreasInput"
              placeholder="Service Areas (comma separated)"
              onChange={handleChange}
            />
          </Stack>
        )}

        {step === 2 && (
          <Stack spacing={4}>
            <Select
              name="categoryId"
              placeholder="Category"
              onChange={handleChange}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>

            <Select
              name="subCategoryId"
              placeholder="Sub Category"
              onChange={handleChange}
            >
              {subCategories.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>

            <Textarea
              name="servicesOfferedInput"
              placeholder="Services Offered (comma separated)"
              onChange={handleChange}
            />

            <Textarea
              name="description"
              placeholder="Service Description"
              onChange={handleChange}
            />

            <Input
              name="yearsExperience"
              placeholder="Years of Experience"
              onChange={handleChange}
            />
          </Stack>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <Stack spacing={4}>
            <Input name="degree" placeholder="Degree" onChange={handleChange} />
            <Input
              name="institution"
              placeholder="Institution"
              onChange={handleChange}
            />
            <Input
              name="yearOfCompletion"
              placeholder="Year of Completion"
              onChange={handleChange}
            />
          </Stack>
        )}

        {step === 4 && (
          <Stack spacing={4}>
            <Input
              name="licenseName"
              placeholder="License Name"
              onChange={handleChange}
            />
            <Input
              name="licenseAuth"
              placeholder="Issuing Authority"
              onChange={handleChange}
            />
            <Input
              name="licenseNumber"
              placeholder="License Number"
              onChange={handleChange}
            />
            <Input name="licenseExpiry" type="date" onChange={handleChange} />
          </Stack>
        )}

        {step === 5 && (
          <Stack spacing={4}>
            <HStack wrap="wrap">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <Checkbox
                  key={day}
                  isChecked={formData.availableDays.includes(day)}
                  onChange={() => handleArrayToggle("availableDays", day)}
                >
                  {day}
                </Checkbox>
              ))}
            </HStack>

            <HStack>
              <Input
                type="time"
                name="availableHoursStart"
                onChange={handleChange}
              />
              <Input
                type="time"
                name="availableHoursEnd"
                onChange={handleChange}
              />
            </HStack>

            <Checkbox
              isChecked={formData.emergency}
              onChange={(e) =>
                setFormData((p) => ({ ...p, emergency: e.target.checked }))
              }
            >
              Emergency / After-hours available
            </Checkbox>
          </Stack>
        )}

        {step === 6 && (
          <Stack spacing={4}>
            <Select name="pricingType" onChange={handleChange}>
              <option value="hourly">Hourly</option>
              <option value="fixed">Fixed</option>
              <option value="project">Per Project</option>
            </Select>

            <Input
              name="baseRate"
              placeholder="Base Rate"
              onChange={handleChange}
            />
            <Input
              name="onSiteCharges"
              placeholder="On-site Charges"
              onChange={handleChange}
            />

            <HStack>
              {["Bank", "Cash", "UPI"].map((p) => (
                <Checkbox
                  key={p}
                  isChecked={formData.paymentMethods.includes(p)}
                  onChange={() => handleArrayToggle("paymentMethods", p)}
                >
                  {p}
                </Checkbox>
              ))}
            </HStack>
          </Stack>
        )}

        {step === 7 && (
          <Stack spacing={4}>
            <Select name="idType" onChange={handleChange}>
              <option value="Passport">Passport</option>
              <option value="Driving License">Driving License</option>
              <option value="National ID">National ID</option>
            </Select>

            <Input
              name="idNumber"
              type="text"
              inputMode={formData.idType === "Passport" ? "text" : "numeric"}
              placeholder={
                formData.idType === "Passport"
                  ? "Passport Number (A1234567)"
                  : "ID Number"
              }
              value={formData.idNumber}
              onChange={handleChange}
            />

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

        {step === 9 && (
          <Stack spacing={4}>
            <Input
              name="otp"
              placeholder="Enter OTP"
              value={formData.otp}
              onChange={handleChange}
            />

            {!otpSent ? (
              <Button
                colorScheme="blue"
                onClick={handleSendOtp}
                isLoading={otpLoading}
              >
                Send OTP
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={handleResendOtp}
                isDisabled={resendTimer > 0}
              >
                {resendTimer > 0
                  ? `Resend OTP in ${resendTimer}s`
                  : "Resend OTP"}
              </Button>
            )}
          </Stack>
        )}

        <HStack w="100%" justify="space-between">
          <Button
            variant="outline"
            onClick={handleBack}
            isDisabled={step === 0}
          >
            Back
          </Button>
          <Button colorScheme="blue" onClick={handleNext} isLoading={loading}>
            {step === TOTAL_STEPS - 1 ? "Verify & Finish" : "Next"}
          </Button>
        </HStack>
      </VStack>
    </Container>
  );
}
