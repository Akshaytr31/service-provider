import {
  Stack,
  Heading,
  FormControl,
  FormLabel,
  Input,
} from "@chakra-ui/react";

export default function EducationStep({ formData, handleChange }) {
  return (
    <Stack spacing={4} width={"full"}>
      <Heading size="sm">Qualification</Heading>

      <FormControl isRequired width={"full"}>
        <FormLabel fontSize="sm">Qualification</FormLabel>
        <Input
          name="degree"
          placeholder="Qualification"
          value={formData.degree}
          onChange={handleChange}
        />
      </FormControl>

      <FormControl isRequired>
        <FormLabel fontSize="sm">Institution</FormLabel>
        <Input
          name="institution"
          placeholder="Institution"
          value={formData.institution}
          onChange={handleChange}
        />
      </FormControl>

      <FormControl isRequired>
        <FormLabel fontSize="sm">Year of Completion</FormLabel>
        <Input
          name="yearOfCompletion"
          placeholder="Year of Completion"
          value={formData.yearOfCompletion}
          onChange={handleChange}
          inputMode="numeric"
          pattern="[0-9]*"
        />
      </FormControl>
    </Stack>
  );
}
