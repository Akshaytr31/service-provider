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
    <Stack spacing={4} width={"full"} position="relative">
      <Heading size="sm" position="absolute" top="-35px" zIndex="1" bg="white" p={'5px'} color={'gray.600'}>Qualification</Heading>
      <Box display={"grid"} gridTemplateColumns={"repeat(2, 1fr)"} gap={"20px"}>  

      <FormControl isRequired width={"full"}>
        <FormLabel fontSize="sm" fontWeight="bold">Qualification</FormLabel>
        <Input
          name="degree"
          placeholder="Qualification"
          value={formData.degree}
          onChange={handleChange}
        />
      </FormControl>

      <FormControl isRequired>
        <FormLabel fontSize="sm" fontWeight="bold">Institution</FormLabel>
        <Input
          name="institution"
          placeholder="Institution"
          value={formData.institution}
          onChange={handleChange}
        />
      </FormControl>

      <FormControl isRequired>
        <FormLabel fontSize="sm" fontWeight="bold">Year of Completion</FormLabel>
        <Input
          name="yearOfCompletion"
          placeholder="Year of Completion"
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
