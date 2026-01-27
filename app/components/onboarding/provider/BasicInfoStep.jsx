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
      <Heading size="sm" color="green.700" fontWeight="bold">
        Basic Details & Type
      </Heading>

      <RadioGroup
        value={formData.userType}
        onChange={(val) => setFormData((p) => ({ ...p, userType: val }))}
        colorScheme="green"
      >
        <HStack spacing={8}>
          <Radio value="individual" size="sm">
            Individual
          </Radio>
          <Radio value="business" size="sm">
            Business
          </Radio>
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
            p={8}
            bg="white"
            border="1px solid"
            borderColor="gray.100"
            borderRadius="2xl"
            boxShadow="sm"
            gridColumn="1 / -1"
            position="relative"
          >
            <Text
              fontWeight="bold"
              mb="12px"
              fontSize="xs"
              position="absolute"
              top="-11px"
              left="20px"
              zIndex="1"
              px={2}
              bg="white"
              color={"green.600"}
              textTransform="uppercase"
              letterSpacing="wider"
            >
              Individual Details
            </Text>
            <Stack
              spacing="14px"
              display={"grid"}
              gridTemplateColumns="repeat(2, 1fr)"
            >
              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
                  First Name
                </FormLabel>
                <Input
                  name="firstName"
                  placeholder="First Name"
                  size="sm"
                  borderRadius="lg"
                  focusBorderColor="green.400"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
                  Last Name
                </FormLabel>
                <Input
                  name="lastName"
                  placeholder="Last Name"
                  size="sm"
                  borderRadius="lg"
                  focusBorderColor="green.400"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
                  Document Type
                </FormLabel>
                <Select
                  name="idType"
                  size="sm"
                  borderRadius="lg"
                  focusBorderColor="green.400"
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
                <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
                  Document Number
                </FormLabel>
                <Input
                  name="idNumber"
                  type="text"
                  size="sm"
                  borderRadius="lg"
                  focusBorderColor="green.400"
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
                  colorScheme="green"
                  size="sm"
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
            p={8}
            bg="white"
            border="1px solid"
            borderColor="gray.100"
            borderRadius="2xl"
            boxShadow="sm"
            gridColumn="1 / -1"
          >
            <LicenseStep
              formData={formData}
              handleChange={handleChange}
              setFormData={setFormData}
            />
          </Box>

          {/* Education */}
          <Box
            p={8}
            bg="white"
            border="1px solid"
            borderColor="gray.100"
            borderRadius="2xl"
            boxShadow="sm"
            gridColumn="1 / -1"
          >
            <EducationStep formData={formData} handleChange={handleChange} />
          </Box>

          {/* Pricing */}
          <Box
            p={8}
            bg="white"
            border="1px solid"
            borderColor="gray.100"
            borderRadius="2xl"
            boxShadow="sm"
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
            p={8}
            bg="white"
            border="1px solid"
            borderColor="gray.100"
            borderRadius="2xl"
            boxShadow="sm"
          >
            <ServiceStep
              formData={formData}
              handleChange={handleChange}
              setFormData={setFormData}
              categories={categories}
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
            p={8}
            bg="white"
            border="1px solid"
            borderColor="gray.100"
            borderRadius="2xl"
            boxShadow="sm"
            position="relative"
          >
            <Heading
              size="xs"
              position="absolute"
              top="-11px"
              left="20px"
              zIndex="1"
              bg="white"
              px={2}
              color={"green.600"}
              textTransform="uppercase"
              letterSpacing="wider"
            >
              Business Details
            </Heading>
            <Box
              display={"grid"}
              gridTemplateColumns={"repeat(2, 1fr)"}
              gap={"20px"}
            >
              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
                  Business Name
                </FormLabel>
                <Input
                  name="businessName"
                  placeholder="Business Name"
                  size="sm"
                  borderRadius="lg"
                  focusBorderColor="green.400"
                  value={formData.businessName}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
                  Business Type
                </FormLabel>
                <Select
                  name="businessType"
                  size="sm"
                  borderRadius="lg"
                  focusBorderColor="green.400"
                  value={formData.businessType}
                  onChange={handleChange}
                >
                  <option value="Company">Company</option>
                  <option value="Agency">Agency</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
                  Registration Number
                </FormLabel>
                <Input
                  name="registrationNumber"
                  placeholder="Registration Number"
                  size="sm"
                  borderRadius="lg"
                  focusBorderColor="green.400"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
                  Establishment Year
                </FormLabel>
                <Input
                  name="establishmentYear"
                  placeholder="Establishment Year"
                  size="sm"
                  borderRadius="lg"
                  focusBorderColor="green.400"
                  value={formData.establishmentYear}
                  onChange={handleChange}
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
                  TRN Number
                </FormLabel>
                <Input
                  name="trnNumber"
                  placeholder="TRN Number"
                  size="sm"
                  borderRadius="lg"
                  focusBorderColor="green.400"
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
            p={8}
            bg="white"
            border="1px solid"
            borderColor="gray.100"
            borderRadius="2xl"
            boxShadow="sm"
            gridColumn="1 / -1"
          >
            <LicenseStep
              formData={formData}
              handleChange={handleChange}
              setFormData={setFormData}
            />
          </Box>
          <Box
            p={8}
            bg="white"
            border="1px solid"
            borderColor="gray.100"
            borderRadius="2xl"
            boxShadow="sm"
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
            p={8}
            bg="white"
            border="1px solid"
            borderColor="gray.100"
            borderRadius="2xl"
            boxShadow="sm"
          >
            <ServiceStep
              formData={formData}
              handleChange={handleChange}
              setFormData={setFormData}
              categories={categories}
            />
          </Box>
        </Stack>
      )}
    </Stack>
  );
}
