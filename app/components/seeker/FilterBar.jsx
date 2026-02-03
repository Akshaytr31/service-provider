"use client";

import {
  Card,
  CardBody,
  Flex,
  Button,
  Icon,
  Divider,
  Input,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  VStack,
  Badge,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { FiMapPin, FiChevronDown, FiDollarSign } from "react-icons/fi";

export default function FilterBar({
  filters,
  handleFilterChange,
  categories,
  selectedCategory,
  priceRange,
  setPriceRange,
  isScrolled,
  onReset,
}) {
  return (
    <Card
      borderRadius="full"
      boxShadow={isScrolled ? "xl" : "lg"}
      border="1px solid"
      borderColor="gray.100"
      bg="white"
      overflow="visible"
      transition="all 0.3s"
    >
      <CardBody py={2} px={4}>
        <Flex
          w="full"
          justify="space-between"
          gap={4}
          align="center"
          direction={{ base: "column", lg: "row" }}
        >
          {/* Location Input */}
          <Flex align="center" gap={2} maxW={{ lg: "250px" }} w="full">
            <Icon as={FiMapPin} color="green.500" fontSize="lg" />
            <Input
              variant="unstyled"
              placeholder="Location"
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              _placeholder={{ color: "gray.400", fontWeight: "medium" }}
              h="40px"
            />
          </Flex>

          <Divider
            orientation="vertical"
            h="24px"
            borderColor="gray.200"
            display={{ base: "none", lg: "block" }}
          />

          {/* Category Select */}
          <Menu matchWidth>
            <MenuButton
              as={Button}
              variant="ghost"
              rightIcon={<Icon as={FiChevronDown} color="gray.400" />}
              textAlign="left"
              fontWeight="medium"
              color={filters.categoryId ? "green.900" : "gray.500"}
              _hover={{ bg: "transparent", color: "green.700" }}
              _active={{ bg: "transparent" }}
              px={2}
              h="40px"
            >
              {filters.categoryId
                ? categories.find(
                    (c) => String(c.id) === String(filters.categoryId),
                  )?.name
                : "All Categories"}
            </MenuButton>
            <MenuList
              borderRadius="xl"
              boxShadow="xl"
              borderColor="gray.100"
              p={2}
            >
              <MenuItem
                fontWeight="medium"
                onClick={() => handleFilterChange("categoryId", "")}
                borderRadius="lg"
                _hover={{ bg: "gray.50" }}
                color={!filters.categoryId ? "green.600" : "gray.700"}
              >
                All Categories
              </MenuItem>
              {categories.map((cat) => (
                <MenuItem
                  key={cat.id}
                  onClick={() => handleFilterChange("categoryId", cat.id)}
                  borderRadius="lg"
                  _hover={{ bg: "gray.50" }}
                  fontWeight={
                    String(filters.categoryId) === String(cat.id)
                      ? "bold"
                      : "medium"
                  }
                  color={
                    String(filters.categoryId) === String(cat.id)
                      ? "green.600"
                      : "gray.700"
                  }
                >
                  {cat.name}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>

          {/* Sub-Category Select (Conditional) */}
          {filters.categoryId && (
            <>
              <Divider
                orientation="vertical"
                h="24px"
                borderColor="gray.200"
                display={{ base: "none", lg: "block" }}
              />
              <Menu matchWidth>
                <MenuButton
                  as={Button}
                  variant="ghost"
                  rightIcon={<Icon as={FiChevronDown} color="gray.400" />}
                  textAlign="left"
                  fontWeight="medium"
                  color={filters.subCategoryId ? "green.900" : "gray.500"}
                  _hover={{ bg: "transparent", color: "green.700" }}
                  _active={{ bg: "transparent" }}
                  px={2}
                  h="40px"
                >
                  {filters.subCategoryId
                    ? selectedCategory?.subCategories?.find(
                        (s) => String(s.id) === String(filters.subCategoryId),
                      )?.name
                    : "Service Type"}
                </MenuButton>
                <MenuList
                  borderRadius="xl"
                  boxShadow="xl"
                  borderColor="gray.100"
                  p={2}
                >
                  <MenuItem
                    fontWeight="medium"
                    onClick={() => handleFilterChange("subCategoryId", "")}
                    borderRadius="lg"
                    _hover={{ bg: "gray.50" }}
                    color={!filters.subCategoryId ? "green.600" : "gray.700"}
                  >
                    All Service Types
                  </MenuItem>
                  {selectedCategory?.subCategories?.map((sub) => (
                    <MenuItem
                      key={sub.id}
                      onClick={() =>
                        handleFilterChange("subCategoryId", sub.id)
                      }
                      borderRadius="lg"
                      _hover={{ bg: "gray.50" }}
                      fontWeight={
                        String(filters.subCategoryId) === String(sub.id)
                          ? "bold"
                          : "medium"
                      }
                      color={
                        String(filters.subCategoryId) === String(sub.id)
                          ? "green.600"
                          : "gray.700"
                      }
                    >
                      {sub.name}
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
            </>
          )}

          <Divider
            orientation="vertical"
            h="24px"
            borderColor="gray.200"
            display={{ base: "none", lg: "block" }}
          />

          {/* Price Popover */}
          <Popover placement="bottom-start" isLazy>
            <PopoverTrigger>
              <Button
                variant="ghost"
                h="40px"
                leftIcon={<Icon as={FiDollarSign} />}
                rightIcon={<Icon as={FiChevronDown} fontSize="xs" />}
                color={
                  filters.minPrice > 0 || filters.maxPrice < 1000
                    ? "green.600"
                    : "gray.500"
                }
                fontWeight="medium"
                borderRadius="full"
                px={4}
                _hover={{ bg: "green.50", color: "green.600" }}
              >
                Price
              </Button>
            </PopoverTrigger>
            <PopoverContent
              borderRadius="xl"
              boxShadow="xl"
              borderColor="gray.100"
              _focus={{ boxShadow: "xl" }}
            >
              <PopoverArrow />
              <PopoverCloseButton />
              <PopoverHeader fontWeight="bold" border="0">
                Price Range
              </PopoverHeader>
              <PopoverBody pb={6}>
                <VStack spacing={4}>
                  <Flex justify="space-between" w="full">
                    <Badge>${priceRange[0]}</Badge>
                    <Badge>${priceRange[1]}</Badge>
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
                    <RangeSliderThumb index={0} boxSize={5} shadow="md" />
                    <RangeSliderThumb index={1} boxSize={5} shadow="md" />
                  </RangeSlider>
                </VStack>
              </PopoverBody>
            </PopoverContent>
          </Popover>

          {/* Reset Button */}
          <Button
            size="sm"
            variant="ghost"
            colorScheme="red"
            borderRadius="full"
            onClick={onReset}
          >
            Reset
          </Button>
        </Flex>
      </CardBody>
    </Card>
  );
}
