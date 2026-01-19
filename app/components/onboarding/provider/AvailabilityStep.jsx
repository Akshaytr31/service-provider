import {
  Stack,
  Heading,
  FormControl,
  FormLabel,
  HStack,
  Checkbox,
  Input,
} from "@chakra-ui/react";

export default function AvailabilityStep({
  formData,
  handleChange,
  setFormData,
  handleArrayToggle,
}) {
  return (
    <Stack
      spacing={4}
      p="20px"
      border="1px solid"
      borderColor="gray.300"
      borderRadius="md"
      bg={"gray.50"}
    >
      <Heading size="sm">Working days and time</Heading>

      {/* Working Days */}
      <FormControl isRequired>
        <FormLabel fontSize="sm">Available Days</FormLabel>
        <HStack wrap="wrap">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <Checkbox
              key={day}
              isChecked={formData.availableDays.includes(day)}
              onChange={() => handleArrayToggle("availableDays", day)}
            >
              {day}
            </Checkbox>
          ))}
        </HStack>
      </FormControl>

      {/* Working Hours */}
      <FormControl isRequired>
        <FormLabel fontSize="sm">Working Hours</FormLabel>
        <HStack>
          <Input
            type="time"
            name="availableHoursStart"
            value={formData.availableHoursStart}
            onChange={handleChange}
          />
          <Input
            type="time"
            name="availableHoursEnd"
            value={formData.availableHoursEnd}
            onChange={handleChange}
          />
        </HStack>
      </FormControl>

      {/* Emergency Availability */}
      <FormControl>
        <Checkbox
          isChecked={formData.emergency}
          onChange={(e) =>
            setFormData((p) => ({ ...p, emergency: e.target.checked }))
          }
        >
          Emergency / After-hours available
        </Checkbox>
      </FormControl>
    </Stack>
  );
}
