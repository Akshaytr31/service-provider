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
} from "@chakra-ui/react";

export default function BasicInfoStep({ form, setForm, handleChange }) {
  return (
    <Stack spacing={6} alignItems={"center"} width="full">
      <Heading size="sm" color="green.700" fontWeight="bold">
        Basic Details & Type
      </Heading>

      <RadioGroup
        value={form.userType}
        onChange={(val) => setForm((p) => ({ ...p, userType: val }))}
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
      {form.userType === "individual" && (
        <Box
          w="full"
          display="grid"
          gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
          gap={6}
          p={8}
          bg="white"
          border="1px solid"
          borderColor="gray.100"
          borderRadius="2xl"
          boxShadow="sm"
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
              value={form.firstName}
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
              value={form.lastName}
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
            <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
              Document Number
            </FormLabel>
            <Input
              name="idNumber"
              type="text"
              size="sm"
              borderRadius="lg"
              focusBorderColor="green.400"
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
                  form.idType === "Passport" ? value : value.replace(/\D/g, "");
                setForm((p) => ({ ...p, idNumber: finalValue }));
              }}
            />
          </FormControl>

          {/* BACKGROUND CHECK */}
          <FormControl gridColumn="1 / -1">
            <Checkbox
              colorScheme="green"
              size="sm"
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
        <Box
          w="full"
          display="grid"
          gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
          gap={6}
          p={8}
          bg="white"
          border="1px solid"
          borderColor="gray.100"
          borderRadius="2xl"
          boxShadow="sm"
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
              value={form.businessName}
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
              value={form.businessType}
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
              value={form.registrationNumber}
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
              value={form.establishmentYear}
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
              value={form.trnNumber}
              onChange={handleChange}
              inputMode="numeric"
              pattern="[0-9]*"
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
              Expiry Date
            </FormLabel>
            <Input
              name="expiryDate"
              type="date"
              size="sm"
              borderRadius="lg"
              focusBorderColor="green.400"
              placeholder="Expiry Date"
              value={form.expiryDate}
              onChange={handleChange}
            />
          </FormControl>
        </Box>
      )}
    </Stack>
  );
}
