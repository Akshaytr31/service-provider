import {
  Box,
  Input,
  List,
  ListItem,
  Text,
  InputGroup,
  InputRightElement,
  Spinner,
  useOutsideClick,
} from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import { FiMapPin } from "react-icons/fi";

// Helper to parse OSM address structure from Nominatim
const parseAddress = (addressObj, displayName) => {
  const city =
    addressObj.city ||
    addressObj.town ||
    addressObj.village ||
    addressObj.hamlet ||
    addressObj.suburb ||
    addressObj.municipality ||
    "";

  const state = addressObj.state || addressObj.region || "";
  const country = addressObj.country || "";
  const zipCode = addressObj.postcode || "";

  return { city, state, country, zipCode, fullAddress: displayName };
};

export default function CityAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Search City...",
}) {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef();

  useOutsideClick({
    ref: ref,
    handler: () => setIsOpen(false),
  });

  // Update query if value prop changes externally (e.g. from parent state)
  useEffect(() => {
    if (value !== query) {
      setQuery(value || "");
    }
  }, [value]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query && query.length > 2 && isOpen) {
        setLoading(true);
        try {
          // Use OpenStreetMap Nominatim API
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              query,
            )}&addressdetails=1&limit=5`,
          );
          const data = await response.json();
          setSuggestions(data);
        } catch (error) {
          console.error("Error fetching suggestions:", error);
          setSuggestions([]);
        } finally {
          setLoading(false);
        }
      } else {
        setSuggestions([]);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [query, isOpen]);

  const handleInputChange = (e) => {
    const newVal = e.target.value;
    setQuery(newVal);
    setIsOpen(true);
    onChange(newVal); // Propagate text change to parent immediately if needed
  };

  const handleSelect = (item) => {
    const addressDetails = item.address;
    const parsed = parseAddress(addressDetails, item.display_name);

    // Call parent handler with parsed data and raw item
    onSelect({
      ...parsed,
      lat: item.lat,
      lon: item.lon,
      raw: item,
    });

    setQuery(parsed.city || item.display_name.split(",")[0]);
    setIsOpen(false);
    setSuggestions([]);
  };

  return (
    <Box position="relative" ref={ref} width="full">
      <InputGroup size="sm">
        <Input
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          borderRadius="lg"
          focusBorderColor="green.400"
          autoComplete="off"
          onFocus={() => setIsOpen(true)}
        />
        {loading && (
          <InputRightElement>
            <Spinner size="xs" color="green.500" />
          </InputRightElement>
        )}
      </InputGroup>

      {isOpen && suggestions.length > 0 && (
        <List
          position="absolute"
          top="100%"
          left={0}
          right={0}
          zIndex={1000}
          bg="white"
          borderRadius="lg"
          boxShadow="lg"
          mt={1}
          border="1px solid"
          borderColor="gray.100"
          maxH="200px"
          overflowY="auto"
        >
          {suggestions.map((item, index) => (
            <ListItem
              key={index}
              p={3}
              cursor="pointer"
              _hover={{ bg: "green.50" }}
              borderBottom={
                index !== suggestions.length - 1 ? "1px solid" : "none"
              }
              borderColor="gray.100"
              onClick={() => handleSelect(item)}
              display="flex"
              alignItems="center"
              gap={3}
            >
              <Box color="green.500">
                <FiMapPin />
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                  {item.display_name.split(",")[0]}
                </Text>
                <Text fontSize="xs" color="gray.500" noOfLines={1}>
                  {item.display_name}
                </Text>
              </Box>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}
