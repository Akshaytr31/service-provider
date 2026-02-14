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
  Heading,
} from "@chakra-ui/react";
import dynamic from "next/dynamic";
import CityAutocomplete from "./CityAutocomplete";

const GoogleMap = dynamic(() => import("../../googleMap/GoogleMap"), {
  ssr: false,
});

export default function ContactStep({ formData, handleChange, setFormData }) {
  const handleCitySelect = (locationData) => {
    // Update all relevant fields based on the selected location
    setFormData((prev) => ({
      ...prev,
      city: locationData.city || prev.city,
      state: locationData.state || prev.state,
      country: locationData.country || prev.country,
      zipCode: locationData.zipCode || prev.zipCode,
      latitude: locationData.lat,
      longitude: locationData.lon,
      // You might also want to update the full address text if you have such a field
      // address: locationData.fullAddress
    }));
  };

  return (
    <Stack
      spacing={6}
      p={8}
      bg="white"
      border="1px solid"
      borderColor="gray.100"
      borderRadius="2xl"
      boxShadow="sm"
      maxWidth={"800px"}
      width={"full"}
      position="relative"
      marginTop={"10px"}
    >
      <Heading
        size="xs"
        fontWeight="bold"
        position="absolute"
        top="-10px"
        left="20px"
        zIndex={1}
        px={2}
        bg="white"
        color="green.600"
        textTransform="uppercase"
        letterSpacing="wider"
      >
        Contact Information
      </Heading>
      <HStack spacing={4}>
        <FormControl isRequired>
          <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
            City
          </FormLabel>
          <CityAutocomplete
            value={formData.city}
            onChange={(val) => setFormData((prev) => ({ ...prev, city: val }))}
            onSelect={handleCitySelect}
            placeholder="Search City"
          />
        </FormControl>

        <FormControl>
          <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
            Zip Code
          </FormLabel>
          <Input
            name="zipCode"
            placeholder="Zip Code"
            size="sm"
            borderRadius="lg"
            focusBorderColor="green.400"
            value={formData.zipCode}
            onChange={handleChange}
            inputMode="numeric"
            pattern="[0-9]*"
          />
        </FormControl>
      </HStack>
      <HStack spacing={4}>
        <FormControl isRequired>
          <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
            State/Emirates/Governorate
          </FormLabel>
          <Input
            name="state"
            placeholder="State"
            size="sm"
            borderRadius="lg"
            focusBorderColor="green.400"
            value={formData.state}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
            Country
          </FormLabel>
          <Input
            name="country"
            placeholder="Country"
            size="sm"
            borderRadius="lg"
            focusBorderColor="green.400"
            value={formData.country}
            onChange={handleChange}
          />
        </FormControl>
      </HStack>

      <GoogleMap formData={formData} setFormData={setFormData} />

      <FormControl isRequired>
        <Card
          p={6}
          bg="green.50"
          border="1px solid"
          borderColor="green.100"
          boxShadow="none"
          borderRadius="xl"
        >
          <FormLabel fontSize="xs" fontWeight="bold" color="green.700" mb={8}>
            Service Radius (km): {formData.serviceRadius || 0}
          </FormLabel>

          <Slider
            min={0}
            max={100}
            step={1}
            colorScheme="green"
            value={Number(formData.serviceRadius) || 0}
            onChange={(val) =>
              setFormData((prev) => ({
                ...prev,
                serviceRadius: val,
              }))
            }
          >
            <SliderMark
              value={0}
              mt="2"
              ml="-2"
              fontSize="10px"
              color="gray.400"
            >
              0
            </SliderMark>
            <SliderMark
              value={50}
              mt="2"
              ml="-2"
              fontSize="10px"
              color="gray.400"
            >
              50
            </SliderMark>
            <SliderMark
              value={100}
              mt="2"
              ml="-4"
              fontSize="10px"
              color="gray.400"
            >
              100
            </SliderMark>

            <SliderTrack bg="white">
              <SliderFilledTrack bg="green.400" />
            </SliderTrack>

            <SliderThumb boxSize={7} bg="green.500">
              <Box color="white" fontSize="10px" fontWeight="bold">
                KM
              </Box>
            </SliderThumb>
          </Slider>
        </Card>
      </FormControl>

      <FormControl>
        <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
          Service Locality
        </FormLabel>
        <Textarea
          name="serviceAreasInput"
          placeholder="Service Locality (comma separated)"
          size="sm"
          borderRadius="lg"
          focusBorderColor="green.400"
          value={formData.serviceAreasInput}
          onChange={handleChange}
          rows={3}
        />
      </FormControl>
    </Stack>
  );
}
