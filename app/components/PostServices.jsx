"use client";

import {
  Box,
  Button,
  Input,
  Textarea,
  Stack,
  Heading,
  Select,
  FormControl,
  FormLabel,
  Image,
  Text,
  Spinner,
  Icon,
  VStack,
  HStack,
  InputGroup,
  InputLeftElement,
  useColorModeValue,
  Container,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import {
  FiUpload,
  FiMapPin,
  FiDollarSign,
  FiType,
  FiFileText,
  FiCheck,
  FiImage,
} from "react-icons/fi";

export default function PostService() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    price: "",
    subCategoryId: "",
    coverPhoto: "",
  });

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [availableSubCategories, setAvailableSubCategories] = useState([]);
  const [serviceRadius, setServiceRadius] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("green.100", "green.900");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch categories and provider request in parallel
        const [categoriesRes, providerRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/provider/current-request"),
        ]);

        const allCategories = await categoriesRes.json();

        if (providerRes.ok) {
          const providerRequest = await providerRes.json();

          if (providerRequest.categoryId && providerRequest.subCategoryId) {
            // Filter Category
            const filteredCategory = allCategories.find(
              (c) => c.id === providerRequest.categoryId,
            );

            if (filteredCategory) {
              // Filter Subcategory
              const filteredSubCategories =
                filteredCategory.subCategories.filter(
                  (sub) => sub.id === providerRequest.subCategoryId,
                );

              // Update category with filtered subcategories
              const finalCategory = {
                ...filteredCategory,
                subCategories: filteredSubCategories,
              };

              setCategories([finalCategory]);
              setSelectedCategory(filteredCategory.id.toString());
              setAvailableSubCategories(filteredSubCategories);
              setForm((prev) => ({
                ...prev,
                subCategoryId: providerRequest.subCategoryId.toString(),
              }));
            }
          } else {
            // Fallback if no specific category in request (though unlikely for approved provider)
            setCategories(allCategories);
          }

          if (providerRequest.serviceRadius) {
            setServiceRadius(providerRequest.serviceRadius);
          }
        } else {
          // Fallback if provider request fetch fails
          setCategories(allCategories);
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Update available subcategories if selectedCategory changes (mostly for manual change if logic allows)
  useEffect(() => {
    if (selectedCategory && categories.length > 0) {
      const category = categories.find(
        (c) => c.id === parseInt(selectedCategory),
      );
      // If we already filtered the subcategories in the initial fetch, use those.
      // Otherwise (fallback case), use all subcategories of the category with matching ID.
      if (category) {
        setAvailableSubCategories(category.subCategories);
      }
    }
  }, [selectedCategory, categories]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/services/upload-cover", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (res.ok) {
        setForm((prev) => ({ ...prev, coverPhoto: data.secureUrl }));
      } else {
        alert("Image upload failed");
      }
    } catch (error) {
      console.error("Upload error", error);
      alert("Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.subCategoryId) {
      alert("Please select a subcategory");
      return;
    }

    const res = await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      alert("Service published successfully");
      setForm({
        title: "",
        description: "",
        location: "",
        price: "",
        subCategoryId: form.subCategoryId, // Keep the fixed subcategory
        coverPhoto: "",
      });
      // Don't reset selectedCategory as it's fixed
    } else {
      alert("Failed to publish service");
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="400px"
      >
        <Spinner size="xl" color="green.500" />
      </Box>
    );
  }

  return (
    <Container maxW="3xl">
      <Box
        bg={bg}
        p={8}
        borderRadius="2xl"
        boxShadow="xl"
        border="1px solid"
        borderColor={borderColor}
      >
        <VStack spacing={8} align="stretch">
          <Box textAlign="center">
            <Text
              fontSize="sm"
              fontWeight="bold"
              color="green.500"
              textTransform="uppercase"
              letterSpacing="wide"
            >
              New Listing
            </Text>
            <Heading size="xl" mt={2} color="gray.700">
              Publish a Service
            </Heading>
            <Text color="gray.500" mt={2}>
              Create a new service listing to reach more customers.
            </Text>
          </Box>

          <Stack spacing={6}>
            <HStack spacing={4}>
              <FormControl>
                <FormLabel color="gray.600" fontSize="sm" fontWeight="semibold">
                  Category
                </FormLabel>
                <Select
                  placeholder="Select Category"
                  value={selectedCategory}
                  isDisabled={true}
                  bg="gray.50"
                  borderColor="gray.200"
                  icon={<Icon as={FiCheck} color="green.500" />}
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isDisabled={!selectedCategory}>
                <FormLabel color="gray.600" fontSize="sm" fontWeight="semibold">
                  Sub Category
                </FormLabel>
                <Select
                  placeholder="Select Sub Category"
                  name="subCategoryId"
                  value={form.subCategoryId}
                  isDisabled={true}
                  bg="gray.50"
                  borderColor="gray.200"
                  icon={<Icon as={FiCheck} color="green.500" />}
                >
                  {availableSubCategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </HStack>

            <HStack>
              <FormControl>
                <FormLabel color="gray.600" fontSize="sm" fontWeight="semibold">
                  Service Radius
                </FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FiMapPin} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    value={serviceRadius ? `${serviceRadius} km` : "N/A"}
                    isReadOnly
                    bg="gray.50"
                    borderColor="gray.200"
                    color="gray.500"
                  />
                </InputGroup>
              </FormControl>
              <FormControl>
                <FormLabel color="gray.600" fontSize="sm" fontWeight="semibold">
                  Price / Rate
                </FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FiDollarSign} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="e.g. $50/hr or Fixed"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    focusBorderColor="green.500"
                  />
                </InputGroup>
              </FormControl>
            </HStack>

            <FormControl>
              <FormLabel color="gray.600" fontSize="sm" fontWeight="semibold">
                Service Title
              </FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiType} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="e.g. Professional Home Cleaning"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  focusBorderColor="green.500"
                  size="lg"
                  fontWeight="medium"
                />
              </InputGroup>
            </FormControl>

            <FormControl>
              <FormLabel color="gray.600" fontSize="sm" fontWeight="semibold">
                Description
              </FormLabel>
              <InputGroup>
                <Textarea
                  placeholder="Describe your service in detail..."
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  focusBorderColor="green.500"
                  rows={4}
                />
              </InputGroup>
            </FormControl>

            <FormControl>
              <FormLabel color="gray.600" fontSize="sm" fontWeight="semibold">
                Location
              </FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiMapPin} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Service Location"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  focusBorderColor="green.500"
                />
              </InputGroup>
            </FormControl>

            <FormControl>
              <FormLabel color="gray.600" fontSize="sm" fontWeight="semibold">
                Cover Photo
              </FormLabel>
              <Box
                border="2px dashed"
                borderColor={form.coverPhoto ? "green.400" : "gray.300"}
                borderRadius="xl"
                p={6}
                textAlign="center"
                bg={form.coverPhoto ? "green.50" : "transparent"}
                transition="all 0.2s"
                _hover={{ borderColor: "green.500", bg: "green.50" }}
                position="relative"
              >
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  isDisabled={uploading}
                  position="absolute"
                  top="0"
                  left="0"
                  height="100%"
                  width="100%"
                  opacity="0"
                  cursor="pointer"
                />

                {uploading ? (
                  <VStack>
                    <Spinner color="green.500" />
                    <Text fontSize="sm" color="gray.500">
                      Uploading...
                    </Text>
                  </VStack>
                ) : form.coverPhoto ? (
                  <HStack spacing={4} justify="center">
                    <Image
                      src={form.coverPhoto}
                      alt="Cover Preview"
                      boxSize="80px"
                      objectFit="cover"
                      borderRadius="lg"
                      boxShadow="md"
                    />
                    <Box textAlign="left">
                      <Text fontWeight="bold" color="green.600">
                        Photo Uploaded
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        Click to replace
                      </Text>
                    </Box>
                  </HStack>
                ) : (
                  <VStack spacing={2}>
                    <Icon as={FiImage} boxSize={8} color="gray.400" />
                    <Text color="gray.500" fontWeight="medium">
                      Click to upload cover photo
                    </Text>
                    <Text fontSize="xs" color="gray.400">
                      SVG, PNG, JPG or GIF (max. 800x400px)
                    </Text>
                  </VStack>
                )}
              </Box>
            </FormControl>

            <Button
              colorScheme="green"
              size="lg"
              onClick={handleSubmit}
              isDisabled={uploading}
              isLoading={uploading}
              loadingText="Publishing..."
              w="full"
              mt={4}
              height="56px"
              fontSize="lg"
              boxShadow="lg"
              _hover={{ transform: "translateY(-2px)", boxShadow: "xl" }}
            >
              Publish Service
            </Button>
          </Stack>
        </VStack>
      </Box>
    </Container>
  );
}
