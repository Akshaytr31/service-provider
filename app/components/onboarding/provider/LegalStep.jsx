import { Stack, Heading, Box, Text, Checkbox } from "@chakra-ui/react";

export default function LegalStep({ formData, setFormData, privacyPolicy }) {
  return (
    <Stack spacing={4}>
      <Heading size="sm">Privacy Policy</Heading>
      <Box
        p={4}
        borderWidth="1px"
        borderRadius="md"
        maxH="300px"
        overflowY="auto"
        bg="gray.800"
        color="white"
      >
        <Text whiteSpace="pre-wrap" fontSize="sm">
          {privacyPolicy || "Loading privacy policy..."}
        </Text>
      </Box>
      <Checkbox
        isChecked={formData.termsAccepted}
        onChange={(e) =>
          setFormData((p) => ({ ...p, termsAccepted: e.target.checked }))
        }
      >
        Accept Terms & Conditions
      </Checkbox>
    </Stack>
  );
}
