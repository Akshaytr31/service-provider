"use client";

import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  Select,
  Stack,
  Text,
  Textarea,
  useToast,
  VStack,
  Heading,
  HStack,
  Checkbox,
  Radio,
  RadioGroup,
  Progress,
  List,
  ListItem
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const STEPS = [
    "Account", "Personal/Business", "Contact", "Service", "Education", "Certs", 
    "Availability", "Pricing", "Identity", "Legal"
];

export default function ProviderSignupPage() {
  const router = useRouter();
  const toast = useToast();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Data
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const [formData, setFormData] = useState({
    // 1. Account
    firstName: "", lastName: "", email: "", mobile: "", password: "", confirmPassword: "",

    // 2. Personal/Business
    userType: "individual", // individual | business
    businessName: "", businessType: "Individual", registrationNumber: "", establishmentYear: "",
    gender: "", dateOfBirth: "", 

    // 3. Contact
    country: "", state: "", city: "", zipCode: "", address: "", serviceRadius: "", 
    serviceAreasInput: "", serviceAreas: [],

    // 4. Service
    categoryId: "", subCategoryId: "", servicesOfferedInput: "", servicesOffered: [],
    description: "", yearsExperience: "",

    // 5. Education
    qualifications: [], // { degree, institution, year } (simplified to one for now or add dynamic)
    degree: "", institution: "", yearOfCompletion: "",

    // 6. Certifications
    licenseName: "", licenseAuth: "", licenseNumber: "", licenseExpiry: "",

    // 7. Availability
    availableDays: [], availableHoursStart: "", availableHoursEnd: "", emergency: false,

    // 8. Pricing
    pricingType: "hourly", baseRate: "", onSiteCharges: "", paymentMethods: [],

    // 9. Identity
    idType: "", idNumber: "", backgroundCheckConsent: false,

    // 12. Legal
    contactMethod: "email",
    termsAccepted: false, privacyAccepted: false, rulesAccepted: false
  });

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
        else if (data.categories) setCategories(data.categories);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (formData.categoryId && categories.length) {
       const cat = categories.find(c => c.id === parseInt(formData.categoryId));
       setSubCategories(cat ? cat.subCategories || [] : []);
    } else {
        setSubCategories([]);
    }
  }, [formData.categoryId, categories]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (name === 'paymentMethods' || name === 'availableDays' ? prev[name] : checked) : value
    }));
  };

  const handleArrayCheck = (arrName, val) => {
      setFormData(prev => {
          const arr = prev[arrName] || [];
          if (arr.includes(val)) return { ...prev, [arrName]: arr.filter(x => x !== val) };
          return { ...prev, [arrName]: [...arr, val] };
      });
  };

  const validateStep = () => {
      // Basic validation implementation
      // Step 0: Account
      if (activeStep === 0) {
          if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) return "Fill all required fields";
          if (formData.password !== formData.confirmPassword) return "Passwords do not match";
      }
      return null;
  };

  const handleNext = async () => {
     const error = validateStep();
     if (error) {
         toast({ title: "Validation Error", description: error, status: "warning" });
         return;
     }

     if (activeStep < STEPS.length - 1) {
         setActiveStep(prev => prev + 1);
     } else {
         handleSubmit();
     }
  };

  const handleSubmit = async () => {
    setLoading(true);

    // Prepare nested objects structure for API
    const payload = {
        ...formData,
        serviceAreas: formData.serviceAreasInput ? formData.serviceAreasInput.split(',').map(s=>s.trim()) : [],
        servicesOffered: formData.servicesOfferedInput ? formData.servicesOfferedInput.split(',').map(s=>s.trim()) : [],
        qualifications: formData.degree ? [{ degree: formData.degree, institution: formData.institution, year: formData.yearOfCompletion }] : [],
        licenses: formData.licenseName ? [{ name: formData.licenseName, authority: formData.licenseAuth, number: formData.licenseNumber, expiry: formData.licenseExpiry }] : [],
        availability: {
            days: formData.availableDays,
            hours: { start: formData.availableHoursStart, end: formData.availableHoursEnd },
            emergency: formData.emergency
        }
    };

    try {
        const res = await fetch("/api/auth/signup/provider", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to register");

        toast({ title: "Registration Successful", description: "Please verify your email", status: "success" });
        router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    } catch (err) {
        toast({ title: "Error", description: err.message, status: "error" });
    } finally {
        setLoading(false);
    }
  };

  const renderStep = () => {
      switch(activeStep) {
          case 0: // Account
            return (
                <Stack spacing={4}>
                    <HStack><Input name="firstName" placeholder="First Name" onChange={handleChange} value={formData.firstName} /><Input name="lastName" placeholder="Last Name" onChange={handleChange} value={formData.lastName} /></HStack>
                    <Input name="email" placeholder="Email Address" onChange={handleChange} value={formData.email} />
                    <Input name="mobile" placeholder="Mobile Number" onChange={handleChange} value={formData.mobile} />
                    <Input name="password" type="password" placeholder="Password" onChange={handleChange} value={formData.password} />
                    <Input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} value={formData.confirmPassword} />
                </Stack>
            );
          case 1: // Personal / Business
            return (
                <Stack spacing={4}>
                    <Text fontWeight="bold">I am a:</Text>
                    <RadioGroup name="userType" onChange={(val) => setFormData(p => ({...p, userType: val}))} value={formData.userType}>
                        <Stack direction="row"><Radio value="individual">Individual</Radio><Radio value="business">Business</Radio></Stack>
                    </RadioGroup>
                    
                    {formData.userType === 'business' ? (
                        <>
                            <Input name="businessName" placeholder="Business Name" onChange={handleChange} value={formData.businessName} />
                            <Select name="businessType" onChange={handleChange} value={formData.businessType}>
                                <option value="Company">Company</option><option value="Agency">Agency</option>
                            </Select>
                            <Input name="registrationNumber" placeholder="Reg Number" onChange={handleChange} value={formData.registrationNumber} />
                            <Input name="establishmentYear" placeholder="Est. Year" onChange={handleChange} value={formData.establishmentYear} />
                        </>
                    ) : (
                        <>
                            <Input name="dateOfBirth" type="date" placeholder="Date of Birth" onChange={handleChange} value={formData.dateOfBirth} />
                            <Select name="gender" placeholder="Gender" onChange={handleChange} value={formData.gender}>
                                <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                            </Select>
                        </>
                    )}
                </Stack>
            );
          case 2: // Contact
             return (
                 <Stack spacing={4}>
                     <HStack><Input name="city" placeholder="City" onChange={handleChange} value={formData.city} /><Input name="zipCode" placeholder="Zip Code" onChange={handleChange} value={formData.zipCode} /></HStack>
                     <Input name="state" placeholder="State" onChange={handleChange} value={formData.state} />
                     <Input name="country" placeholder="Country" onChange={handleChange} value={formData.country} />
                     <Textarea name="address" placeholder="Full Address" onChange={handleChange} value={formData.address} />
                     <Input name="serviceRadius" placeholder="Service Radius (km)" onChange={handleChange} value={formData.serviceRadius} />
                     <Textarea name="serviceAreasInput" placeholder="Service Areas (comma separated)" onChange={handleChange} value={formData.serviceAreasInput} />
                 </Stack>
             );
          case 3: // Service
             return (
                 <Stack spacing={4}>
                     <Select name="categoryId" placeholder="Category" onChange={handleChange} value={formData.categoryId}>
                         {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                     </Select>
                     <Select name="subCategoryId" placeholder="SubCategory" onChange={handleChange} value={formData.subCategoryId}>
                         {subCategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                     </Select>
                     <Textarea name="servicesOfferedInput" placeholder="Services Offered (comma separated)" onChange={handleChange} value={formData.servicesOfferedInput} />
                     <Textarea name="description" placeholder="Description of Services" onChange={handleChange} value={formData.description} />
                     <Input name="yearsExperience" placeholder="Years of Experience" onChange={handleChange} value={formData.yearsExperience} />
                 </Stack>
             );
          case 4: // Education
             return (
                 <Stack spacing={4}>
                     <Heading size="sm">Highest Qualification</Heading>
                     <Input name="degree" placeholder="Degree / Qualification" onChange={handleChange} value={formData.degree} />
                     <Input name="institution" placeholder="Institution / University" onChange={handleChange} value={formData.institution} />
                     <Input name="yearOfCompletion" placeholder="Year of Completion" onChange={handleChange} value={formData.yearOfCompletion} />
                 </Stack>
             );
          case 5: // Certs
             return (
                 <Stack spacing={4}>
                     <Heading size="sm">Certification / License</Heading>
                     <Input name="licenseName" placeholder="License Name" onChange={handleChange} value={formData.licenseName} />
                     <Input name="licenseAuth" placeholder="Issuing Authority" onChange={handleChange} value={formData.licenseAuth} />
                     <Input name="licenseNumber" placeholder="License Number" onChange={handleChange} value={formData.licenseNumber} />
                     <Input name="licenseExpiry" placeholder="Expiry Date" type="date" onChange={handleChange} value={formData.licenseExpiry} />
                 </Stack>
             );
          case 6: // Availability
             return (
                 <Stack spacing={4}>
                     <Text fontWeight="bold">Working Days:</Text>
                     <HStack wrap="wrap">
                         {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                             <Checkbox key={day} isChecked={formData.availableDays?.includes(day)} onChange={() => handleArrayCheck('availableDays', day)}>{day}</Checkbox>
                         ))}
                     </HStack>
                     <HStack>
                         <Input name="availableHoursStart" type="time" placeholder="Start" onChange={handleChange} value={formData.availableHoursStart} />
                         <Text>to</Text>
                         <Input name="availableHoursEnd" type="time" placeholder="End" onChange={handleChange} value={formData.availableHoursEnd} />
                     </HStack>
                     <Checkbox name="emergency" isChecked={formData.emergency} onChange={(e) => setFormData(p => ({...p, emergency: e.target.checked}))}>Emergency / After-hours available</Checkbox>
                 </Stack>
             );
           case 7: // Pricing
             return (
                 <Stack spacing={4}>
                     <Select name="pricingType" onChange={handleChange} value={formData.pricingType}>
                         <option value="hourly">Hourly</option><option value="fixed">Fixed</option><option value="project">Per Project</option>
                     </Select>
                     <Input name="baseRate" placeholder="Base Rate / Price Range" onChange={handleChange} value={formData.baseRate} />
                     <Input name="onSiteCharges" placeholder="On-site Charges" onChange={handleChange} value={formData.onSiteCharges} />
                     <Text fontWeight="bold">Payment Methods:</Text>
                     <HStack>
                         <Checkbox isChecked={formData.paymentMethods?.includes('Bank')} onChange={() => handleArrayCheck('paymentMethods', 'Bank')}>Bank</Checkbox>
                         <Checkbox isChecked={formData.paymentMethods?.includes('Cash')} onChange={() => handleArrayCheck('paymentMethods', 'Cash')}>Cash</Checkbox>
                         <Checkbox isChecked={formData.paymentMethods?.includes('UPI')} onChange={() => handleArrayCheck('paymentMethods', 'UPI')}>UPI</Checkbox>
                     </HStack>
                 </Stack>
             );
           case 8: // Identity
             return (
                 <Stack spacing={4}>
                     <Select name="idType" placeholder="ID Type" onChange={handleChange} value={formData.idType}>
                         <option value="Passport">Passport</option><option value="Driving License">Driving License</option><option value="National ID">National ID</option>
                     </Select>
                     <Input name="idNumber" placeholder="ID Number" onChange={handleChange} value={formData.idNumber} />
                     <Checkbox name="backgroundCheckConsent" isChecked={formData.backgroundCheckConsent} onChange={(e) => setFormData(p => ({...p, backgroundCheckConsent: e.target.checked}))}>
                         I consent to a background check
                     </Checkbox>
                 </Stack>
             );
           case 9: // Legal
             return (
                 <Stack spacing={4}>
                     <Checkbox name="termsAccepted" isChecked={formData.termsAccepted} onChange={(e) => setFormData(p => ({...p, termsAccepted: e.target.checked}))}>I accept Terms & Conditions</Checkbox>
                     <Checkbox name="privacyAccepted" isChecked={formData.privacyAccepted} onChange={(e) => setFormData(p => ({...p, privacyAccepted: e.target.checked}))}>I accept Privacy Policy</Checkbox>
                     <Checkbox name="rulesAccepted" isChecked={formData.rulesAccepted} onChange={(e) => setFormData(p => ({...p, rulesAccepted: e.target.checked}))}>I agree to Platform Rules</Checkbox>
                 </Stack>
             );
          default: return null;
      }
  };

  return (
    <Container maxW="container.md" py={10}>
       <VStack spacing={6} align="stretch" bg="white" p={8} borderRadius="lg" boxShadow="md">
         <Heading size="md" textAlign="center">Provider Registration</Heading>
         <Progress value={(activeStep / (STEPS.length - 1)) * 100} mb={4} />
         <Heading size="sm" color="gray.600">{STEPS[activeStep]}</Heading>
         
         <Box minH="300px">
            {renderStep()}
         </Box>

         <HStack justify="space-between" mt={4}>
             <Button variant="outline" onClick={() => setActiveStep(p => Math.max(0, p - 1))} isDisabled={activeStep === 0}>Back</Button>
             <Button colorScheme="blue" onClick={handleNext} isLoading={loading}>
                 {activeStep === STEPS.length - 1 ? "Submit" : "Next"}
             </Button>
         </HStack>
       </VStack>
    </Container>
  );
}
