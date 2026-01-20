import {
  Stack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Box,
} from "@chakra-ui/react";

export default function LicenseStep({ formData, handleChange }) {
  return (
    <Stack spacing={4} width={"full"} position="relative">
      <Heading size="sm" position="absolute" top="-35px" zIndex="1" bg="white" p={'5px'} color={'gray.600'}>License</Heading>
      <Box display={"grid"} gridTemplateColumns="repeat(2, 1fr)" gap={'20px'}>
        <FormControl isRequired width={"full"}>
          <FormLabel fontSize="sm" fontWeight="bold">License Name</FormLabel>
          <Input
            name="licenseName"
            placeholder="License Name"
            value={formData.licenseName}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel fontSize="sm" fontWeight="bold">Issuing Authority</FormLabel>
          <Input
            name="licenseAuth"
            placeholder="Issuing Authority"
            value={formData.licenseAuth}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel fontSize="sm" fontWeight="bold">License Number</FormLabel>
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
          <FormLabel fontSize="sm" fontWeight="bold">License Expiry Date</FormLabel>
          <Input
            name="licenseExpiry"
            type="date"
            value={formData.licenseExpiry}
            onChange={handleChange}
          />
        </FormControl>
      </Box>
    </Stack>
  );
}
