import {
  Stack,
  Heading,
  FormControl,
  FormLabel,
  Input,
} from "@chakra-ui/react";

export default function LicenseStep({ formData, handleChange }) {
  return (
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
          inputMode="numeric"
          pattern="[0-9]*"
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
  );
}
