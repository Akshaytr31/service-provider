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
        size="sm"
        position="absolute"
        top="-35px"
        zIndex="1"
        bg="white"
        p={"5px"}
        color={"gray.600"}
      >
        Fix your price
      </Heading>

      {/* Pricing Type */}
      <Box display={"grid"} gridTemplateColumns={"repeat(2, 1fr)"} gap={"20px"}>
        <FormControl isRequired width={"full"}>
          <FormLabel fontSize="sm" fontWeight="bold">Pricing Type</FormLabel>
          <Select
            name="pricingType"
            value={formData.pricingType}
            onChange={handleChange}
          >
            <option value="hourly">Hourly</option>
            <option value="fixed">Fixed</option>
            <option value="project">Per Project</option>
          </Select>
        </FormControl>

        {/* Base Rate */}
        <FormControl isRequired width={"full"}>
          <FormLabel fontSize="sm" fontWeight="bold">Base Rate</FormLabel>
          <Input
            name="baseRate"
            placeholder="Enter base rate"
            value={formData.baseRate}
            onChange={handleChange}
            inputMode="numeric"
            pattern="[0-9]*"
          />
        </FormControl>

        {/* Payment Methods */}
        <FormControl isRequired>
          <FormLabel fontSize="sm">Payment Methods</FormLabel>
          <HStack spacing={4}>
            {["Bank", "App"].map((p) => (
              <Checkbox
                key={p}
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
