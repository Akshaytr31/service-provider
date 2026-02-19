import { Stack, HStack, FormControl, FormLabel, Input } from "@chakra-ui/react";
import dynamic from "next/dynamic";
import CityAutocomplete from "./CityAutocomplete";

const GoogleMap = dynamic(() => import("../../googleMap/GoogleMap"), {
  ssr: false,
});

export default function AddressStep({ form, handleChange, setForm }) {
  const handleCitySelect = (locationData) => {
    setForm((prev) => ({
      ...prev,
      city: locationData.city || prev.city,
      state: locationData.state || prev.state,
      country: locationData.country || prev.country,
      zipCode: locationData.zipCode || prev.zipCode,
      latitude: locationData.lat,
      longitude: locationData.lon,
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
    >
      <HStack spacing={4}>
        <FormControl isRequired>
          <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
            City
          </FormLabel>
          <CityAutocomplete
            value={form.city}
            onChange={(val) => setForm((prev) => ({ ...prev, city: val }))}
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
            value={form.zipCode}
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
            value={form.state}
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
            value={form.country}
            onChange={handleChange}
          />
        </FormControl>
      </HStack>

      <GoogleMap formData={form} setFormData={setForm} />
    </Stack>
  );
}
