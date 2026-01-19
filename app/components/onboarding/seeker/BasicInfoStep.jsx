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
            <Select name="idType" value={form.idType} onChange={handleChange}>
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
                  form.idType === "Passport" ? value : value.replace(/\D/g, "");
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
  );
}
