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
  IconButton,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  useBreakpointValue,
  Text as ChakraText,
  Container,
} from "@chakra-ui/react";
import {
  FiMapPin,
  FiChevronDown,
  FiDollarSign,
  FiFilter,
} from "react-icons/fi";

// Extracted FilterContent component to prevent re-renders and focus loss
const FilterContent = ({
  isMobileView = false,
  filters,
  handleFilterChange,
  categories,
  selectedCategory,
  priceRange,
  setPriceRange,
  onReset,
}) => (
  <Flex
    w="full"
    justify="space-between"
    gap={4}
    align={isMobileView ? "stretch" : "center"}
    direction={isMobileView ? "column" : "row"}
  >
    {/* Location Input */}
    <Flex
      align="center"
      gap={2}
      maxW={!isMobileView ? { lg: "250px" } : "full"}
      w="full"
    >
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

    {!isMobileView && (
      <Divider
        orientation="vertical"
        h="24px"
        borderColor="gray.200"
        display={{ base: "none", lg: "block" }}
      />
    )}
    {isMobileView && <Divider />}

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
        w={isMobileView ? "full" : "auto"}
      >
        {filters.categoryId
          ? categories.find((c) => String(c.id) === String(filters.categoryId))
              ?.name
          : "All Categories"}
      </MenuButton>
      <MenuList
        borderRadius="xl"
        boxShadow="xl"
        borderColor="gray.100"
        p={2}
        zIndex={1400}
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
              String(filters.categoryId) === String(cat.id) ? "bold" : "medium"
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
        {!isMobileView && (
          <Divider
            orientation="vertical"
            h="24px"
            borderColor="gray.200"
            display={{ base: "none", lg: "block" }}
          />
        )}
        {isMobileView && <Divider />}

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
            w={isMobileView ? "full" : "auto"}
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
            zIndex={1400}
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
                onClick={() => handleFilterChange("subCategoryId", sub.id)}
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

    {!isMobileView && (
      <Divider
        orientation="vertical"
        h="24px"
        borderColor="gray.200"
        display={{ base: "none", lg: "block" }}
      />
    )}
    {isMobileView && <Divider />}

    {/* Price Popover - Only on Desktop, standard collapse on Mobile or just inline */}
    {!isMobileView ? (
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
    ) : (
      <VStack w="full" align="stretch" spacing={2}>
        <Flex align="center" gap={2}>
          <Icon as={FiDollarSign} color="gray.500" />
          <ChakraText fontWeight="medium" color="gray.700">
            Price Range
          </ChakraText>
        </Flex>
        <Flex justify="space-between" w="full">
          <Badge>${priceRange[0]}</Badge>
          <Badge>${priceRange[1]}</Badge>
        </Flex>
        <RangeSlider
          aria-label={["min", "max"]}
          min={0}
          max={2000}
          step={10}
          value={priceRange}
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
    )}

    {/* Reset Button */}
    <Button
      size="sm"
      variant="ghost"
      colorScheme="red"
      borderRadius="full"
      onClick={onReset}
      w={isMobileView ? "full" : "auto"}
    >
      Reset
    </Button>
  </Flex>
);

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
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, lg: false });

  return (
    <>
      {/* DESTKOP VIEW */}
      <Card
        display={{ base: "none", lg: "block" }}
        boxShadow={isScrolled ? "sm" : "none"}
        borderTop="1px solid"
        borderBottom="1px solid"
        borderColor="gray.200"
        bg="white"
        overflow="visible"
        transition="all 0.3s"
        borderRadius={0}
        w="full"
      >
        <CardBody py={2} px={0}>
          <Container maxW="container.xl">
            <FilterContent
              isMobileView={false}
              filters={filters}
              handleFilterChange={handleFilterChange}
              categories={categories}
              selectedCategory={selectedCategory}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              onReset={onReset}
            />
          </Container>
        </CardBody>
      </Card>

      {/* MOBILE VIEW (Floating Action Button style or similar) */}
      <Flex display={{ base: "flex", lg: "none" }} justify="flex-end">
        <Button
          leftIcon={<Icon as={FiFilter} />}
          colorScheme="green"
          borderRadius="full"
          shadow="xl"
          onClick={onOpen}
          bg="white"
          color="green.600"
          _hover={{ bg: "green.50" }}
        >
          Filters
        </Button>
      </Flex>

      {/* MOBILE DRAWER */}
      <Drawer isOpen={isOpen} placement="bottom" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent borderTopRadius="2xl">
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Filters</DrawerHeader>
          <DrawerBody py={6}>
            <FilterContent
              isMobileView={true}
              filters={filters}
              handleFilterChange={handleFilterChange}
              categories={categories}
              selectedCategory={selectedCategory}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              onReset={onReset}
            />
          </DrawerBody>
          <DrawerFooter borderTopWidth="1px">
            <Button variant="outline" mr={3} onClick={onReset} w="full">
              Reset
            </Button>
            <Button colorScheme="green" onClick={onClose} w="full">
              Done
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
