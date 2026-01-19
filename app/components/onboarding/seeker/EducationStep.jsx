import { Stack, FormControl, FormLabel, Select, Input } from "@chakra-ui/react";

export default function EducationStep({ form, setForm }) {
  return (
    <Stack spacing={4}>
      <FormControl isRequired>
        <FormLabel>Qualification</FormLabel>
        <Select
          placeholder="Select qualification"
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
        <FormLabel>Field of Study</FormLabel>
        <Input
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
        <FormLabel>Institution</FormLabel>
        <Input
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
        <FormLabel>Year of Completion</FormLabel>
        <Input
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
