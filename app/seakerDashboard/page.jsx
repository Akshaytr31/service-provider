"use client";

import {
  Box,
  Heading,
  Text,
  Flex,
  Grid,
  Container,
  Icon,
  Skeleton,
  VStack,
  SimpleGrid,
} from "@chakra-ui/react";
import ServiceCard from "../components/seeker/ServiceCard";
import FilterBar from "../components/seeker/FilterBar";
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiFilter,
  FiUserCheck,
  FiBriefcase,
  FiAward,
  FiShield,
} from "react-icons/fi";
import PlatformStatsCard from "../components/seeker/StatusCard";
import HeaderCard from "../components/seeker/HeaderCard";

const MotionBox = motion(Box);
const MotionGrid = motion(Grid);

export default function SeekerDashboard() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  // Filter States
  const [filters, setFilters] = useState({
    categoryId: "",
    subCategoryId: "",
    location: "",
    minPrice: 0,
    maxPrice: 1000,
  });

  const [priceRange, setPriceRange] = useState([0, 1000]); // Visual state for slider

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      // 1. Category
      if (filters.categoryId) {
        // We need to know if the service's sub_category_id belongs to the selected category
        const categorySubCatIds =
          selectedCategory?.subCategories?.map((sc) => String(sc.id)) || [];
        if (!categorySubCatIds.includes(String(service.sub_category_id))) {
          return false;
        }
      }

      // 2. Sub Category
      if (filters.subCategoryId) {
        if (String(service.sub_category_id) !== String(filters.subCategoryId))
          return false;
      }

      // 3. Location
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
    <Box minH="100vh" bg="#FFFFFF" position="relative">
      {/* HEADER / HERO SECTION */}
      <Box
        bgGradient="linear(to-br, green.50, blue.50, purple.50)"
        borderBottom="1px solid"
        borderColor="gray.200"
        pt={24}
        pb={12}
        px={8}
        mb={8}
        position="relative"
        overflow="hidden"
      >
        {/* Decorative shapes */}
        <Box
          position="absolute"
          top="-50px"
          right="-50px"
          w="200px"
          h="200px"
          borderRadius="full"
          bg="green.100"
          opacity={0.3}
          filter="blur(40px)"
        />
        <Box
          position="absolute"
          bottom="-30px"
          left="-30px"
          w="150px"
          h="150px"
          borderRadius="full"
          bg="blue.100"
          opacity={0.3}
          filter="blur(40px)"
        />

        <Container maxW="8xl" position="relative" zIndex={1}>
          <Flex
            justify="space-between"
            align="center"
            direction={{ base: "column", lg: "row" }}
            gap={8}
          >
            {/* Left Column */}
            <HeaderCard />

            {/* Right Column - Stats Card */}
            <PlatformStatsCard />
          </Flex>
        </Container>
      </Box>
      
      <Container maxW="8xl" px={8} pb={20}>
        <Flex gap={8} align="start" direction={{ base: "column", lg: "row" }}>
          {/* DESKTOP SIDEBAR FILTER */}
          <FilterBar
            filters={filters}
            handleFilterChange={handleFilterChange}
            categories={categories}
            selectedCategory={selectedCategory}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            isScrolled={isScrolled}
            onReset={() => {
              setFilters({
                categoryId: "",
                subCategoryId: "",
                location: "",
                minPrice: 0,
                maxPrice: 3000,
              });
              setPriceRange([0, 3000]);
            }}
          />

          {/* RESULTS GRID - Takes remaining space */}
          <Box flex="1" w="full" minW="0">
            <AnimatePresence mode="wait">
              {loading ? (
                <SimpleGrid
                  columns={{ base: 1, md: 2, lg: 3, xl: 3, "2xl": 4 }} // Adjusted columns for wider container
                  spacing={6}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <Skeleton
                      key={i}
                      height="380px"
                      borderRadius="xl"
                      startColor="gray.50"
                      endColor="gray.100"
                    />
                  ))}
                </SimpleGrid>
              ) : (
                <Box minH="400px">
                  <Flex justify="space-between" align="center" mb={6}>
                    <Text color="gray.500" fontSize="sm" fontWeight="medium">
                      Showing{" "}
                      <Text as="span" color="green.600" fontWeight="bold">
                        {filteredServices.length}
                      </Text>{" "}
                      results
                    </Text>
                  </Flex>

                  <MotionGrid
                    templateColumns="repeat(auto-fill, minmax(300px, 1fr))" // Slightly wider cards if needed
                    gap={6}
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.05,
                        },
                      },
                    }}
                  >
                    {filteredServices.map((service) => (
                      <ServiceCard key={service.id} service={service} />
                    ))}
                  </MotionGrid>

                  {!loading && filteredServices.length === 0 && (
                    <Flex
                      direction="column"
                      align="center"
                      justify="center"
                      py={24}
                      bg="gray.50"
                      borderRadius="2xl"
                      border="1px dashed"
                      borderColor="gray.200"
                    >
                      <Box
                        p={4}
                        bg="white"
                        borderRadius="full"
                        mb={4}
                        shadow="sm"
                      >
                        <Icon as={FiFilter} w={8} h={8} color="gray.400" />
                      </Box>
                      <Heading size="md" color="gray.700" mb={2}>
                        No matches found
                      </Heading>
                      <Text color="gray.400">
                        Try adjusting your filters to see more results.
                      </Text>
                    </Flex>
                  )}
                </Box>
              )}
            </AnimatePresence>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
}
