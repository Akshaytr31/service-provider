import {
  Stack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Card,
  Slider,
  SliderMark,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Box,
} from "@chakra-ui/react";

export default function ContactStep({ formData, handleChange, setFormData }) {
  return (
    <Stack
      spacing={4}
      p="20px"
      border="1px solid"
      borderColor="gray.300"
      borderRadius="md"
      maxWidth={"800px"}
    >
      <HStack>
        <FormControl isRequired>
          <FormLabel fontSize="sm">City</FormLabel>
          <Input
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel fontSize="sm">Zip Code</FormLabel>
          <Input
            name="zipCode"
            placeholder="Zip Code"
            value={formData.zipCode}
            onChange={handleChange}
            inputMode="numeric"
            pattern="[0-9]*"
          />
        </FormControl>
      </HStack>

      <FormControl isRequired>
        <FormLabel fontSize="sm">State/Emirates/Governorate</FormLabel>
        <Input
          name="state"
          placeholder="State"
          value={formData.state}
          onChange={handleChange}
        />
      </FormControl>

      <FormControl isRequired>
        <FormLabel fontSize="sm">Country</FormLabel>
        <Input
          name="country"
          placeholder="Country"
          value={formData.country}
          onChange={handleChange}
        />
      </FormControl>

      <FormControl isRequired>
        <FormLabel fontSize="sm">Full Address</FormLabel>
        <Textarea
          name="address"
          placeholder="Full Address"
          value={formData.address}
          onChange={handleChange}
        />
      </FormControl>

      <FormControl isRequired>
        <Card padding={"20px"} border={"1px solid #e2e8f0"} boxShadow={"none"}>
          <FormLabel fontSize="sm">
            Service Radius (km): {formData.serviceRadius || 0}
          </FormLabel>

          <Slider
            min={0}
            max={100}
            step={1}
            value={Number(formData.serviceRadius) || 0}
            onChange={(val) =>
              setFormData((prev) => ({
                ...prev,
                serviceRadius: val,
              }))
            }
          >
            <SliderMark value={0} mt="2" ml="-2" fontSize="xs">
              0
            </SliderMark>
            <SliderMark value={50} mt="2" ml="-2" fontSize="xs">
              50
            </SliderMark>
            <SliderMark value={100} mt="2" ml="-4" fontSize="xs">
              100
            </SliderMark>

            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>

            <SliderThumb boxSize={6} backgroundColor="blue.500">
              <Box color="white" fontSize="10px">
                KM
              </Box>
            </SliderThumb>
          </Slider>
        </Card>
      </FormControl>

      <FormControl>
        <FormLabel fontSize="sm">Service Locality</FormLabel>
        <Textarea
          name="serviceAreasInput"
          placeholder="Service Locality (comma separated)"
          value={formData.serviceAreasInput}
          onChange={handleChange}
        />
      </FormControl>
    </Stack>
  );
}
