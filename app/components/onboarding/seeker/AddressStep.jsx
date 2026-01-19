import {
  Stack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
} from "@chakra-ui/react";

export default function AddressStep({ form, handleChange }) {
  return (
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
  );
}
