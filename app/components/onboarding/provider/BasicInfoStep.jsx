import {
  Stack,
  Heading,
  RadioGroup,
  HStack,
  Radio,
  Box,
  FormControl,
  FormLabel,
  Input,
  Select,
  Checkbox,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";

import LicenseStep from "./LicenseStep";
import EducationStep from "./EducationStep";
import PricingStep from "./PricingStep";
import ServiceStep from "./ServiceStep";

export default function BasicInfoStep({
  formData,
  handleChange,
  setFormData,
  handleArrayToggle,
  categories,
  subCategories,
}) {
  return (
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
        <Box
          w="full"
          display="grid"
          gridTemplateColumns="repeat(2, 1fr)"
          gap="30px"
        >
          {/* Individual Details */}
          <Box
            p="20px"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            gridColumn="1 / -1"
            position="relative"
          >
            <Text
              fontWeight="semibold"
              mb="12px"
              fontSize="md"
              position="absolute"
              top="-17px"
              zIndex="1"
              p={'5px'}
              bg="white"
              color={'gray.600'}
            >
              Individual Details
            </Text>
            <Stack spacing="14px" display={"grid"} gridTemplateColumns="repeat(2, 1fr)">
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="bold">First Name</FormLabel>
                <Input
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="bold">Last Name</FormLabel>
                <Input
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="bold">Document Type</FormLabel>
                <Select
                  name="idType"
                  value={formData.idType}
                  onChange={handleChange}
                >
                  <option value="" disabled>
                    Select ID
                  </option>
                  <option value="Passport">Passport</option>
                  <option value="Driving License">Driving License</option>
                  <option value="National ID">National ID</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="bold">Document Number</FormLabel>
                <Input
                  name="idNumber"
                  type="text"
                  inputMode={
                    formData.idType === "Passport" ? "text" : "numeric"
                  }
                  pattern={
                    formData.idType === "Passport" ? undefined : "[0-9]*"
                  }
                  placeholder={
                    formData.idType === "Passport"
                      ? "Passport Number (A1234567)"
                      : "ID Number"
                  }
                  value={formData.idNumber}
                  onChange={(e) => {
                    const { value } = e.target;
                    const finalValue =
                      formData.idType === "Passport"
                        ? value
                        : value.replace(/\D/g, "");
                    setFormData((p) => ({ ...p, idNumber: finalValue }));
                  }}
                />
              </FormControl>

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
            </Stack>
          </Box>

          {/* License */}
          <Box
            p="20px"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            gridColumn="1 / -1"
          >
            <LicenseStep formData={formData} handleChange={handleChange} />
          </Box>

          {/* Education */}
          <Box
            p="20px"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            gridColumn="1 / -1"
          >
            <EducationStep formData={formData} handleChange={handleChange} />
          </Box>

          {/* Pricing */}
          <Box
            p="20px"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            gridColumn="1 / -1"
          >
            <PricingStep
              formData={formData}
              handleChange={handleChange}
              handleArrayToggle={handleArrayToggle}
            />
          </Box>

          {/* Services – Full Width */}
          <Box
            gridColumn="1 / -1"
            p="20px"
            border="1px solid"
            borderColor="gray.300"
            borderRadius="md"
          >
            <ServiceStep
              formData={formData}
              handleChange={handleChange}
              setFormData={setFormData}
              categories={categories}
              subCategories={subCategories}
            />
          </Box>
        </Box>
      )}

      {/* BUSINESS FIELDS */}
      {formData.userType === "business" && (
        <Stack
          spacing={4}
          width={"full"}
          display={"grid"}
          gridTemplateColumns={"repeat(2, 1fr)"}
          gap={"40px"}
        >
          <Box
            gridColumn="1 / -1"
            p="20px"
            border="1px solid"
            borderColor="gray.300"
            borderRadius="md"
            position="relative"
          >
            <Heading size="sm" position="absolute" top="-17px" zIndex="1" bg="white" p={'5px'} color={'gray.600'}>Business Details</Heading>
            <Box display={"grid"} gridTemplateColumns={"repeat(2, 1fr)"} gap={"20px"}>

            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="bold">Business Name</FormLabel>
              <Input
                name="businessName"
                placeholder="Business Name"
                value={formData.businessName}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="bold">Business Type</FormLabel>
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
              <FormLabel fontSize="sm" fontWeight="bold">Registration Number</FormLabel>
              <Input
                name="registrationNumber"
                placeholder="Registration Number"
                value={formData.registrationNumber}
                onChange={handleChange}
                inputMode="numeric"
                pattern="[0-9]*"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="bold">Establishment Year</FormLabel>
              <Input
                name="establishmentYear"
                placeholder="Establishment Year"
                value={formData.establishmentYear}
                onChange={handleChange}
                inputMode="numeric"
                pattern="[0-9]*"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="bold">TRN Number</FormLabel>
              <Input
                name="trnNumber"
                placeholder="TRN Number"
                value={formData.trnNumber}
                onChange={handleChange}
                inputMode="numeric"
                pattern="[0-9]*"
              />
            </FormControl>
            </Box>
            {/* <FormControl isRequired>
              <FormLabel fontSize="sm">Expiry Date</FormLabel>
              <Input
                name="expiryDate"
                type="date"
                placeholder="Expiry Date"
                value={formData.expiryDate}
                onChange={handleChange}
              />
            </FormControl> */}
          </Box>
          <Box
            p="20px"
            border="1px solid"
            borderColor="gray.300"
            borderRadius="md"
            gridColumn="1 / -1"
          >
            <LicenseStep formData={formData} handleChange={handleChange} />
          </Box>
          <Box
            p="20px"
            border="1px solid"
            borderColor="gray.300"
            borderRadius="md"
            gridColumn="1 / -1"
          >
            <PricingStep
              formData={formData}
              handleChange={handleChange}
              handleArrayToggle={handleArrayToggle}
            />
          </Box>
          <Box
            gridColumn="1 / -1"
            p="20px"
            border="1px solid"
            borderColor="gray.300"
            borderRadius="md"
          >
            <ServiceStep
              formData={formData}
              handleChange={handleChange}
              setFormData={setFormData}
              categories={categories}
              subCategories={subCategories}
            />
          </Box>
        </Stack>
      )}
    </Stack>
  );
}
