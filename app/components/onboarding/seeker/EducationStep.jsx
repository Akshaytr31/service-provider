import {
  Stack,
  FormControl,
  FormLabel,
  Select,
  Input,
  Heading,
} from "@chakra-ui/react";

export default function EducationStep({ form, setForm }) {
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
      <Heading size="sm" color="green.700" fontWeight="bold">
        Education Details
      </Heading>
      <FormControl isRequired>
        <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
          Qualification
        </FormLabel>
        <Select
          placeholder="Select qualification"
          size="sm"
          borderRadius="lg"
          focusBorderColor="green.400"
          value={form.education.qualification}
          onChange={(e) =>
            setForm({
              ...form,
              education: {
                ...form.education,
                qualification: e.target.value,
              },
            })
          }
        >
          <option>High School</option>
          <option>Diploma</option>
          <option>Bachelor’s Degree</option>
          <option>Master’s Degree</option>
          <option>Doctorate</option>
        </Select>
      </FormControl>

      <FormControl isRequired>
        <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
          Field of Study
        </FormLabel>
        <Input
          placeholder="e.g. Computer Science"
          size="sm"
          borderRadius="lg"
          focusBorderColor="green.400"
          value={form.education.field}
          onChange={(e) =>
            setForm({
              ...form,
              education: { ...form.education, field: e.target.value },
            })
          }
        />
      </FormControl>

      <FormControl isRequired>
        <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
          Institution
        </FormLabel>
        <Input
          placeholder="e.g. University Name"
          size="sm"
          borderRadius="lg"
          focusBorderColor="green.400"
          value={form.education.institution}
          onChange={(e) =>
            setForm({
              ...form,
              education: { ...form.education, institution: e.target.value },
            })
          }
        />
      </FormControl>

      <FormControl isRequired>
        <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
          Year of Completion
        </FormLabel>
        <Input
          placeholder="YYYY"
          size="sm"
          borderRadius="lg"
          focusBorderColor="green.400"
          value={form.education.year}
          onChange={(e) =>
            setForm({
              ...form,
              education: {
                ...form.education,
                year: e.target.value.replace(/\D/g, ""),
              },
            })
          }
          inputMode="numeric"
          pattern="[0-9]*"
        />
      </FormControl>
    </Stack>
  );
}
