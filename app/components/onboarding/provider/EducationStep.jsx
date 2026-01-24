import {
  Stack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Box,
} from "@chakra-ui/react";

export default function EducationStep({ formData, handleChange }) {
  return (
    <Stack spacing={6} width={"full"} position="relative">
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
        Qualification
      </Heading>
      <Box display={"grid"} gridTemplateColumns={"repeat(2, 1fr)"} gap={6}>
        <FormControl isRequired width={"full"}>
          <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
            Qualification
          </FormLabel>
          <Input
            name="degree"
            placeholder="e.g. Bachelor of Technology"
            size="sm"
            borderRadius="lg"
            focusBorderColor="green.400"
            value={formData.degree}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
            Institution
          </FormLabel>
          <Input
            name="institution"
            placeholder="e.g. University Name"
            size="sm"
            borderRadius="lg"
            focusBorderColor="green.400"
            value={formData.institution}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
            Year of Completion
          </FormLabel>
          <Input
            name="yearOfCompletion"
            placeholder="YYYY"
            size="sm"
            borderRadius="lg"
            focusBorderColor="green.400"
            value={formData.yearOfCompletion}
            onChange={handleChange}
            inputMode="numeric"
            pattern="[0-9]*"
          />
        </FormControl>
      </Box>
    </Stack>
  );
}
