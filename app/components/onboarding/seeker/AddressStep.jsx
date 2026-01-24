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
    <Stack
      spacing={6}
      p={8}
      bg="white"
      border="1px solid"
      borderColor="gray.100"
      borderRadius="2xl"
      boxShadow="sm"
    >
      <HStack spacing={4}>
        <FormControl isRequired>
          <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
            City
          </FormLabel>
          <Input
            name="city"
            placeholder="City"
            size="sm"
            borderRadius="lg"
            focusBorderColor="green.400"
            value={form.city}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
            Zip Code
          </FormLabel>
          <Input
            name="zipCode"
            placeholder="Zip Code"
            size="sm"
            borderRadius="lg"
            focusBorderColor="green.400"
            value={form.zipCode}
            onChange={handleChange}
            inputMode="numeric"
            pattern="[0-9]*"
          />
        </FormControl>
      </HStack>

      <FormControl isRequired>
        <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
          State/Emirates/Governorate
        </FormLabel>
        <Input
          name="state"
          placeholder="State"
          size="sm"
          borderRadius="lg"
          focusBorderColor="green.400"
          value={form.state}
          onChange={handleChange}
        />
      </FormControl>

      <FormControl isRequired>
        <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
          Country
        </FormLabel>
        <Input
          name="country"
          placeholder="Country"
          size="sm"
          borderRadius="lg"
          focusBorderColor="green.400"
          value={form.country}
          onChange={handleChange}
        />
      </FormControl>

      <FormControl isRequired>
        <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
          Full Address
        </FormLabel>
        <Textarea
          name="address"
          placeholder="Full Address"
          size="sm"
          borderRadius="lg"
          focusBorderColor="green.400"
          value={form.address}
          onChange={handleChange}
          rows={3}
        />
      </FormControl>
    </Stack>
  );
}
