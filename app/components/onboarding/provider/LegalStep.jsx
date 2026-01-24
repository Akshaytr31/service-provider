import { Stack, Heading, Box, Text, Checkbox } from "@chakra-ui/react";

export default function LegalStep({ formData, setFormData, privacyPolicy }) {
  return (
    <Stack spacing={6}>
      <Heading size="sm" color="green.700" fontWeight="bold">
        Privacy Policy
      </Heading>
      <Box
        p={6}
        border="1px solid"
        borderColor="gray.100"
        borderRadius="2xl"
        maxH="300px"
        overflowY="auto"
        bg="green.50"
        color="gray.700"
        boxShadow="inner"
      >
        <Text whiteSpace="pre-wrap" fontSize="xs" lineHeight="tall">
          {privacyPolicy || "Loading privacy policy..."}
        </Text>
      </Box>
      <Checkbox
        colorScheme="green"
        size="sm"
        isChecked={formData.termsAccepted}
        onChange={(e) =>
          setFormData((p) => ({ ...p, termsAccepted: e.target.checked }))
        }
      >
        <Text fontSize="sm" color="gray.600">
          Accept Terms & Conditions
        </Text>
      </Checkbox>
    </Stack>
  );
}
