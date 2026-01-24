import {
  Stack,
  Heading,
  FormControl,
  FormLabel,
  Select,
  Input,
  HStack,
  Checkbox,
  Box,
} from "@chakra-ui/react";

export default function PricingStep({
  formData,
  handleChange,
  handleArrayToggle,
}) {
  return (
    <Stack spacing={4} width={"full"} position="relative">
      <Heading
        size="xs"
        position="absolute"
        top="-45px"
        left="0"
        zIndex="1"
        bg="white"
        px={2}
        color={"green.600"}
        textTransform="uppercase"
        letterSpacing="wider"
        fontWeight="bold"
      >
        Pricing Detail
      </Heading>

      {/* Pricing Type */}
      <Box display={"grid"} gridTemplateColumns={"repeat(2, 1fr)"} gap={6}>
        <FormControl isRequired width={"full"}>
          <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
            Pricing Type
          </FormLabel>
          <Select
            name="pricingType"
            size="sm"
            borderRadius="lg"
            focusBorderColor="green.400"
            value={formData.pricingType}
            onChange={handleChange}
          >
            <option value="hourly">Hourly Rate</option>
            <option value="fixed">Fixed Price</option>
            <option value="project">Per Project</option>
          </Select>
        </FormControl>

        {/* Base Rate */}
        <FormControl isRequired width={"full"}>
          <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
            Base Rate
          </FormLabel>
          <Input
            name="baseRate"
            placeholder="e.g. 500"
            size="sm"
            borderRadius="lg"
            focusBorderColor="green.400"
            value={formData.baseRate}
            onChange={handleChange}
            inputMode="numeric"
            pattern="[0-9]*"
          />
        </FormControl>

        {/* Payment Methods */}
        <FormControl isRequired>
          <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
            Payment Methods
          </FormLabel>
          <HStack spacing={6}>
            {["Bank", "App"].map((p) => (
              <Checkbox
                key={p}
                size="sm"
                colorScheme="green"
                isChecked={formData.paymentMethods.includes(p)}
                onChange={() => handleArrayToggle("paymentMethods", p)}
              >
                {p}
              </Checkbox>
            ))}
          </HStack>
        </FormControl>
      </Box>
    </Stack>
  );
}
