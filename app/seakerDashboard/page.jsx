"use client";

import {
  Box,
  Heading,
  Text,
  Stack,
  Card,
  CardBody,
  Flex,
  Button,
  Grid,
  Container,
  Icon,
  Badge,
  Skeleton,
  Divider,
  Input,
  Select,
  VStack,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Collapse,
  useDisclosure,
} from "@chakra-ui/react";
import ServiceCard from "../components/seeker/ServiceCard";
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiFilter, FiX } from "react-icons/fi";

const MotionBox = motion(Box);
const MotionGrid = motion(Grid);

export default function SeekerDashboard() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [filters, setFilters] = useState({
    categoryId: "",
    subCategoryId: "",
    location: "",
    minPrice: 0,
    maxPrice: 1000,
  });

  const [priceRange, setPriceRange] = useState([0, 1000]); // Visual state for slider
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true }); // Filter sidebar visibility on mobile/desktop

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, categoriesRes] = await Promise.all([
          fetch("/api/services"),
          fetch("/api/categories"),
        ]);

        if (!servicesRes.ok || !categoriesRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const servicesData = await servicesRes.json();
        const categoriesData = await categoriesRes.json();

        console.log("Services:", servicesData);
        setServices(servicesData);
        setCategories(categoriesData.categories || categoriesData); // Handle potential structure difference
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      // Reset subcategory if category changes
      ...(field === "categoryId" ? { subCategoryId: "" } : {}),
    }));
  };

  const selectedCategory = useMemo(() => {
    return categories.find((c) => String(c.id) === String(filters.categoryId));
  }, [categories, filters.categoryId]);

  // Derived filtered services
  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      // 1. Category (Check sub_category_id against category's subcategories)
      if (filters.categoryId) {
        // We need to know if the service's sub_category_id belongs to the selected category
        const categorySubCatIds =
          selectedCategory?.subCategories?.map((sc) => String(sc.id)) || [];
        if (!categorySubCatIds.includes(String(service.sub_category_id))) {
          return false;
        }
      }

      // 2. Sub Category (Direct Match)
      if (filters.subCategoryId) {
        if (String(service.sub_category_id) !== String(filters.subCategoryId))
          return false;
      }

      // 3. Location (Partial Match)
      if (filters.location) {
        if (
          !service.location
            ?.toLowerCase()
            .includes(filters.location.toLowerCase())
        )
          return false;
      }

      // 4. Price Range
      const price = Number(service.price);
      if (price < filters.minPrice || price > filters.maxPrice) return false;

      return true;
    });
  }, [services, filters, selectedCategory]);

  return (
    <Box minH="100vh" bg="gray.50" pt="100px" pb={20} position="relative">
      <Container maxW="container.xl">
        {/* Header Section */}
        <Flex justify="space-between" align="center" mb={8} wrap="wrap" gap={4}>
          <Heading color="green.800" fontWeight="black" letterSpacing="tight">
            Find Services
          </Heading>
          <Button
            leftIcon={<Icon as={isOpen ? FiX : FiFilter} />}
            onClick={onToggle}
            variant="outline"
            colorScheme="green"
            display={{ base: "flex", lg: "none" }}
          >
            {isOpen ? "Hide Filters" : "Show Filters"}
          </Button>
        </Flex>

        <Flex gap={8} direction={{ base: "column", lg: "row" }}>
          {/* FILTER SIDEBAR */}
          <Collapse in={isOpen} animateOpacity style={{ overflow: "visible" }}>
            <Box
              w={{ base: "full", lg: "300px" }}
              bg="white"
              p={6}
              borderRadius="2xl"
              boxShadow="sm"
              position="sticky"
              top="120px"
              h="fit-content"
            >
              <VStack spacing={6} align="stretch">
                <Heading size="sm" color="gray.700">
                  Filters
                </Heading>

                <FormControl>
                  <FormLabel
                    fontSize="xs"
                    fontWeight="bold"
                    color="gray.500"
                    textTransform="uppercase"
                  >
                    Category
                  </FormLabel>
                  <Select
                    placeholder="All Categories"
                    size="sm"
                    borderRadius="lg"
                    value={filters.categoryId}
                    onChange={(e) =>
                      handleFilterChange("categoryId", e.target.value)
                    }
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                {filters.categoryId && (
                  <FormControl>
                    <FormLabel
                      fontSize="xs"
                      fontWeight="bold"
                      color="gray.500"
                      textTransform="uppercase"
                    >
                      Sub-Category
                    </FormLabel>
                    <Select
                      placeholder="All Sub-Categories"
                      size="sm"
                      borderRadius="lg"
                      value={filters.subCategoryId}
                      onChange={(e) =>
                        handleFilterChange("subCategoryId", e.target.value)
                      }
                    >
                      {selectedCategory?.subCategories?.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                )}

                <Divider />

                <FormControl>
                  <FormLabel
                    fontSize="xs"
                    fontWeight="bold"
                    color="gray.500"
                    textTransform="uppercase"
                  >
                    Location
                  </FormLabel>
                  <Input
                    placeholder="Enter City or Area"
                    size="sm"
                    borderRadius="lg"
                    value={filters.location}
                    onChange={(e) =>
                      handleFilterChange("location", e.target.value)
                    }
                  />
                </FormControl>

                <Divider />

                <FormControl>
                  <Flex justify="space-between" mb={2}>
                    <FormLabel
                      fontSize="xs"
                      fontWeight="bold"
                      color="gray.500"
                      textTransform="uppercase"
                      m={0}
                    >
                      Price Range
                    </FormLabel>
                    <Text fontSize="xs" fontWeight="bold" color="green.600">
                      ${filters.minPrice} - ${filters.maxPrice}
                    </Text>
                  </Flex>
                  <RangeSlider
                    // eslint-disable-next-line jsx-a11y/aria-proptypes
                    aria-label={["min", "max"]}
                    min={0}
                    max={2000}
                    step={10}
                    defaultValue={[0, 1000]}
                    onChangeEnd={(val) => {
                      handleFilterChange("minPrice", val[0]);
                      handleFilterChange("maxPrice", val[1]);
                    }}
                    onChange={(val) => setPriceRange(val)}
                  >
                    <RangeSliderTrack bg="gray.100">
                      <RangeSliderFilledTrack bg="green.500" />
                    </RangeSliderTrack>
                    <RangeSliderThumb
                      index={0}
                      boxSize={5}
                      shadow="md"
                      borderColor="gray.200"
                    />
                    <RangeSliderThumb
                      index={1}
                      boxSize={5}
                      shadow="md"
                      borderColor="gray.200"
                    />
                  </RangeSlider>
                </FormControl>

                <Button
                  size="sm"
                  variant="ghost"
                  colorScheme="gray"
                  onClick={() => {
                    setFilters({
                      search: "",
                      categoryId: "",
                      subCategoryId: "",
                      location: "",
                      minPrice: 0,
                      maxPrice: 1000,
                    });
                    setPriceRange([0, 1000]);
                  }}
                >
                  Reset Filters
                </Button>
              </VStack>
            </Box>
          </Collapse>

          {/* RESULTS GRID */}
          <Box flex="1">
            <AnimatePresence>
              {loading ? (
                <Grid
                  templateColumns="repeat(auto-fill, minmax(300px, 1fr))"
                  gap={6}
                >
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton
                      key={i}
                      height="340px"
                      borderRadius="2xl"
                      startColor="white"
                      endColor="gray.100"
                    />
                  ))}
                </Grid>
              ) : (
                <>
                  <Text mb={4} color="gray.500" fontSize="sm">
                    Showing {filteredServices.length} results
                  </Text>
                  <MotionGrid
                    templateColumns="repeat(auto-fill, minmax(300px, 1fr))"
                    gap={6}
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.1,
                        },
                      },
                    }}
                  >
                    {filteredServices.map((service) => (
                      <ServiceCard key={service.id} service={service} />
                    ))}
                  </MotionGrid>
                </>
              )}
            </AnimatePresence>

            {!loading && filteredServices.length === 0 && (
              <Box
                textAlign="center"
                py={20}
                bg="white"
                borderRadius="2xl"
                border="1px solid"
                borderColor="gray.100"
              >
                <Icon as={FiFilter} w={10} h={10} color="gray.300" mb={4} />
                <Heading size="md" color="gray.600" mb={2}>
                  No matches found
                </Heading>
                <Text color="gray.400">
                  Try adjusting your filters or search terms.
                </Text>
              </Box>
            )}
          </Box>
        </Flex>
      </Container>
    </Box>
  );
}
