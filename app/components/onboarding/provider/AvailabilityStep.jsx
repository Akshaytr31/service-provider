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
      spacing={6}
      p={8}
      marginTop={"10px"}
      bg="white"
      border="1px solid"
      borderColor="gray.100"
      borderRadius="2xl"
      boxShadow="sm"
      maxWidth={"800px"}
      position="relative"
    >
      <Heading
        size="xs"
        fontWeight="bold"
        position="absolute"
        top="-12px"
        left="20px"
        zIndex={1}
        px={2}
        bg="white"
        color="green.600"
        textTransform="uppercase"
        letterSpacing="wider"
      >
        Working days and time
      </Heading>

      {/* Working Days */}
      <FormControl isRequired>
        <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
          Available Days
        </FormLabel>
        <HStack wrap="wrap">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <Checkbox
              key={day}
              colorScheme="green"
              isChecked={formData.availableDays.includes(day)}
              onChange={() => handleArrayToggle("availableDays", day)}
              size="sm"
            >
              {day}
            </Checkbox>
          ))}
        </HStack>
      </FormControl>

      {/* Working Hours */}
      <FormControl isRequired>
        <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
          Working Hours
        </FormLabel>
        <HStack>
          <Input
            type="time"
            name="availableHoursStart"
            value={formData.availableHoursStart}
            onChange={handleChange}
            borderRadius="lg"
            fontSize="sm"
            focusBorderColor="green.400"
          />
          <Input
            type="time"
            name="availableHoursEnd"
            value={formData.availableHoursEnd}
            onChange={handleChange}
            borderRadius="lg"
            fontSize="sm"
            focusBorderColor="green.400"
          />
        </HStack>
      </FormControl>

      {/* Emergency Availability */}
      <FormControl>
        <Checkbox
          colorScheme="green"
          isChecked={formData.emergency}
          onChange={(e) =>
            setFormData((p) => ({ ...p, emergency: e.target.checked }))
          }
          size="sm"
        >
          Emergency / After-hours available
        </Checkbox>
      </FormControl>
    </Stack>
  );
}
