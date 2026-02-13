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
  useToast, // Import useToast
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

  const [allCategories, setAllCategories] = useState([]);
  const [approvedServices, setApprovedServices] = useState([]); // Array of {categoryId, subCategoryId, categoryName, subCategoryName}
  const [selectedServiceIndex, setSelectedServiceIndex] = useState(0); // Index of selected service combo
  const [serviceRadius, setServiceRadius] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const toast = useToast(); // Initialize toast

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

        const categories = await categoriesRes.json();
        setAllCategories(categories);

        if (providerRes.ok) {
          const providerRequest = await providerRes.json();
          const licenses = providerRequest.licenses || [];

          let allServices = [];

          // Helper to find license status
          const getLicenseStatus = (subCatId) => {
            if (!subCatId) return "N/A";

            // Find ALL licenses that match this subcategory
            const matchingLicenses = licenses.filter(
              (l) => parseInt(l.subCategoryId) === parseInt(subCatId),
            );

            if (matchingLicenses.length === 0) return "MISSING";

            // Prioritize statuses: APPROVED > PENDING > EXPIRED
            if (matchingLicenses.some((l) => l.status === "APPROVED"))
              return "APPROVED";
            if (matchingLicenses.some((l) => l.status === "PENDING"))
              return "PENDING";
            if (matchingLicenses.some((l) => l.status === "EXPIRED"))
              return "EXPIRED";

            // Fallback for missing/unknown status
            // If the provider request itself is APPROVED, assume undefined license status means APPROVED
            const requestStatus = providerRequest.status;
            return (
              matchingLicenses[0].status ||
              (requestStatus === "APPROVED" || requestStatus === "approved"
                ? "APPROVED"
                : "PENDING")
            );
          };

          // 1. Add services from servicesOffered array
          if (
            providerRequest.servicesOffered &&
            Array.isArray(providerRequest.servicesOffered)
          ) {
            allServices = providerRequest.servicesOffered.map((service) => {
              const category = categories.find(
                (c) => c.id === parseInt(service.categoryId),
              );
              const subCategory = category?.subCategories.find(
                (sub) => sub.id === parseInt(service.subCategoryId),
              );
              return {
                categoryId: service.categoryId,
                subCategoryId: service.subCategoryId,
                categoryName: category?.name || "Unknown Category",
                subCategoryName: subCategory?.name || "Unknown Subcategory",
                licenseStatus: getLicenseStatus(service.subCategoryId),
              };
            });
          }

          // 2. Add Primary Service (if valid and not duplicate)
          if (providerRequest.categoryId && providerRequest.subCategoryId) {
            const primaryExists = allServices.some(
              (s) =>
                parseInt(s.categoryId) ===
                  parseInt(providerRequest.categoryId) &&
                parseInt(s.subCategoryId) ===
                  parseInt(providerRequest.subCategoryId),
            );

            if (!primaryExists) {
              const category = categories.find(
                (c) => c.id === parseInt(providerRequest.categoryId),
              );
              const subCategory = category?.subCategories.find(
                (sub) => sub.id === parseInt(providerRequest.subCategoryId),
              );

              if (category && subCategory) {
                allServices.unshift({
                  categoryId: providerRequest.categoryId,
                  subCategoryId: providerRequest.subCategoryId,
                  categoryName: category.name,
                  subCategoryName: subCategory.name,
                  isPrimary: true,
                  licenseStatus: getLicenseStatus(
                    providerRequest.subCategoryId,
                  ),
                });
              }
            }
          }

          setApprovedServices(allServices);

          // Set default service
          if (allServices.length > 0) {
            setSelectedServiceIndex(0);
            setForm((prev) => ({
              ...prev,
              subCategoryId: allServices[0].subCategoryId?.toString() || "",
            }));
          }

          if (providerRequest.serviceRadius) {
            setServiceRadius(providerRequest.serviceRadius);
          }
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Update form when selectedServiceIndex changes
  useEffect(() => {
    if (approvedServices.length > 0 && selectedServiceIndex >= 0) {
      const selectedService = approvedServices[selectedServiceIndex];
      setForm((prev) => ({
        ...prev,
        subCategoryId: selectedService.subCategoryId?.toString() || "",
      }));
    }
  }, [selectedServiceIndex, approvedServices]);

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
        toast({
          title: "Image Uploaded",
          description: "Cover photo uploaded successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Upload Failed",
          description: "Image upload failed.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Upload error", error);
      toast({
        title: "Error",
        description: "An error occurred while uploading the image.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (
      !form.title ||
      !form.description ||
      !form.price ||
      !form.subCategoryId
    ) {
      toast({
        title: "Missing Fields",
        description:
          "Please fill in all required fields (Title, Description, Price, Service Type).",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // License Check
    const selectedService = approvedServices[selectedServiceIndex];
    if (
      selectedService &&
      selectedService.licenseStatus &&
      selectedService.licenseStatus !== "APPROVED"
    ) {
      toast({
        title: "License Not Approved",
        description: `You cannot post this service because the required license is ${selectedService.licenseStatus}. Please wait for admin approval.`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const res = await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (res.ok) {
      toast({
        title: "Success!",
        description: "Service published successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
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
      toast({
        title: "Failed",
        description: data.error || "Failed to publish service.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
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
            <FormControl>
              <FormLabel color="gray.600" fontSize="sm" fontWeight="semibold">
                Service Type
                {approvedServices.length > 1 && (
                  <Text as="span" color="green.500" fontSize="xs" ml={2}>
                    (You have {approvedServices.length} approved service types)
                  </Text>
                )}
              </FormLabel>
              <Select
                value={selectedServiceIndex}
                onChange={(e) =>
                  setSelectedServiceIndex(parseInt(e.target.value))
                }
                bg="gray.50"
                borderColor="gray.200"
                icon={<Icon as={FiCheck} color="green.500" />}
              >
                {approvedServices.map((service, index) => {
                  const isApproved = service.licenseStatus === "APPROVED";
                  const statusLabel = isApproved
                    ? ""
                    : ` (${service.licenseStatus || "Pending Approval"})`;
                  return (
                    <option key={index} value={index}>
                      {service.categoryName} → {service.subCategoryName}
                      {statusLabel}
                    </option>
                  );
                })}
              </Select>
              {approvedServices[selectedServiceIndex]?.licenseStatus !==
                "APPROVED" && (
                <Text fontSize="xs" color="red.500" mt={1}>
                  * License for{" "}
                  <Text as="span" fontWeight="bold">
                    {approvedServices[selectedServiceIndex]?.subCategoryName}
                  </Text>{" "}
                  is{" "}
                  {approvedServices[selectedServiceIndex]?.licenseStatus ===
                  "MISSING"
                    ? "missing"
                    : "pending approval"}
                  . You cannot post this service yet.
                </Text>
              )}
            </FormControl>

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
                    placeholder="e.g. AED 50/hr or Fixed"
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
