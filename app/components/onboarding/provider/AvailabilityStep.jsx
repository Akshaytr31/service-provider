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
      marginTop={'10px'}
      border="1px solid"
      borderColor="gray.300"
      borderRadius="md"
      maxWidth={"800px"}
      position="relative"
    >
      <Heading size="sm" fontWeight="bold" position="absolute" top="-16px" left="10px" zIndex={1} p="5px" bg="white"> Working days and time</Heading>

      {/* Working Days */}
      <FormControl isRequired>
        <FormLabel fontSize="sm" fontWeight="bold">Available Days</FormLabel>
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
        <FormLabel fontSize="sm" fontWeight="bold">Working Hours</FormLabel>
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
