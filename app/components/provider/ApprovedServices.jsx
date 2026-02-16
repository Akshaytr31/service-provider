"use client";
import {
  Box,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Icon,
  Flex,
  Badge,
  Spinner,
  Card,
  CardBody,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast,
  VStack,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import {
  FiArrowLeft,
  FiBriefcase,
  FiMapPin,
  FiEdit2,
  FiCheck,
  FiX,
  FiTrash2,
} from "react-icons/fi";

export default function ApprovedServices({ onBack }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false); // Add uploading state

  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    try {
      setLoading(true);
      const res = await fetch("/api/services?mine=true");
      if (res.ok) {
        const data = await res.json();
        setServices(data);
      }
    } catch (error) {
      console.error("Error fetching services", error);
      toast({
        title: "Error fetching services",
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  }

  const handleCardClick = (service) => {
    setSelectedService(service);
    setEditFormData(service); // Initialize edit form with service data
    setIsEditing(false); // Reset edit mode
    onOpen();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
        setEditFormData((prev) => ({ ...prev, coverPhoto: data.secureUrl }));
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

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/services/${selectedService.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editFormData),
      });

      if (res.ok) {
        toast({
          title: "Service updated successfully",
          status: "success",
          duration: 3000,
        });

        // Update local state
        setServices((prev) =>
          prev.map((s) =>
            s.id === selectedService.id ? { ...s, ...editFormData } : s,
          ),
        );
        setSelectedService({ ...selectedService, ...editFormData });
        setIsEditing(false);
      } else {
        throw new Error("Failed to update service");
      }
    } catch (error) {
      console.error("Error updating service", error);
      toast({
        title: "Error updating service",
        description: "Please try again later.",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box mt={6} position="relative">
      <Flex justify="space-between" align="center" mb={8}>
        <Button
          variant="ghost"
          colorScheme="gray"
          onClick={onBack}
          leftIcon={<FiArrowLeft />}
          size="sm"
        >
          Back to Dashboard
        </Button>
      </Flex>

      <Heading mb={2} color="green.800" fontSize="2xl">
        My Services
      </Heading>
      <Text color="gray.500" mb={8}>
        Manage your active services and listings.
      </Text>

      {loading ? (
        <Flex justify="center" p={10}>
          <Spinner
            color="green.500"
            size="xl"
            emptyColor="gray.200"
            thickness="4px"
          />
        </Flex>
      ) : services.length === 0 ? (
        <Flex
          direction="column"
          align="center"
          justify="center"
          bg="white"
          p={12}
          borderRadius="2xl"
          boxShadow="sm"
          border="1px dashed"
          borderColor="gray.200"
        >
          <Icon as={FiBriefcase} boxSize={12} color="gray.300" mb={4} />
          <Heading size="md" color="gray.600" mb={2}>
            No Services Found
          </Heading>
          <Text color="gray.500">You haven't posted any services yet.</Text>
        </Flex>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
          {services.map((service) => (
            <Card
              key={service.id}
              borderRadius="2xl"
              boxShadow="sm"
              overflow="hidden"
              cursor="pointer"
              onClick={() => handleCardClick(service)}
              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              _hover={{
                transform: "translateY(-4px)",
                boxShadow: "xl",
                borderColor: "green.200",
              }}
              border="1px solid"
              borderColor="gray.100"
              bg="white"
            >
              <Box position="relative" h="180px" overflow="hidden">
                {service.coverPhoto ? (
                  <Image
                    src={service.coverPhoto}
                    alt={service.title}
                    w="100%"
                    h="100%"
                    objectFit="cover"
                    transition="transform 0.3s"
                    _groupHover={{ transform: "scale(1.05)" }}
                  />
                ) : (
                  <Flex
                    w="100%"
                    h="100%"
                    bgGradient="linear(to-br, gray.50, gray.100)"
                    align="center"
                    justify="center"
                  >
                    <Icon as={FiBriefcase} boxSize={8} color="gray.300" />
                  </Flex>
                )}
                <Badge
                  position="absolute"
                  top={3}
                  right={3}
                  colorScheme={service.status === "ACTIVE" ? "green" : "red"}
                  fontSize="xs"
                  px={2}
                  py={1}
                  borderRadius="full"
                  boxShadow="sm"
                  textTransform="capitalize"
                >
                  {service.status.toLowerCase()}
                </Badge>
              </Box>

              <CardBody p={5}>
                <VStack align="start" spacing={3}>
                  <Box>
                    <Text
                      fontSize="xs"
                      fontWeight="medium"
                      color="green.600"
                      textTransform="uppercase"
                      letterSpacing="wide"
                      mb={1}
                    >
                      {service.categoryName || "Service"}
                    </Text>
                    <Heading
                      size="md"
                      color="gray.800"
                      noOfLines={1}
                      lineHeight="short"
                    >
                      {service.title}
                    </Heading>
                  </Box>

                  <Flex align="center" color="gray.500" fontSize="sm">
                    <Icon as={FiMapPin} mr={1.5} />
                    <Text noOfLines={1}>{service.location || "Remote"}</Text>
                  </Flex>

                  <HStack
                    justify="space-between"
                    w="full"
                    pt={2}
                    borderTop="1px solid"
                    borderColor="gray.50"
                  >
                    <Text fontSize="lg" fontWeight="bold" color="green.700">
                      AED {service.price}
                      <Text
                        as="span"
                        fontSize="xs"
                        color="gray.400"
                        fontWeight="normal"
                        ml={1}
                      >
                        / hr
                      </Text>
                    </Text>
                    {service.rating > 0 && (
                      <Flex
                        align="center"
                        bg="orange.50"
                        px={2}
                        py={0.5}
                        borderRadius="md"
                      >
                        <Text
                          fontSize="xs"
                          fontWeight="bold"
                          color="orange.600"
                        >
                          ★ {service.rating}
                        </Text>
                      </Flex>
                    )}
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}

      {/* "Incredible" Service Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="5xl"
        scrollBehavior="inside"
        isCentered
        motionPreset="slideInBottom"
      >
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent
          borderRadius="3xl"
          overflow="hidden"
          boxShadow="dark-lg"
          bg="white"
          css={{
            "&::-webkit-scrollbar": { display: "none" },
            "& *::-webkit-scrollbar": { display: "none" },
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {/* Header Actions (Absolute) */}
          <Flex position="absolute" top={6} right={6} zIndex={10} gap={3}>
            {!isEditing && (
              <Button
                size="sm"
                bg="whiteAlpha.900"
                color="gray.800"
                boxShadow="md"
                leftIcon={<FiEdit2 />}
                onClick={() => setIsEditing(true)}
                _hover={{
                  bg: "white",
                  transform: "translateY(-2px)",
                  boxShadow: "lg",
                }}
                borderRadius="full"
                backdropFilter="blur(8px)"
              >
                Edit
              </Button>
            )}
            <IconButton
              icon={<FiX />}
              onClick={onClose}
              boxShadow="md"
              bg="whiteAlpha.900"
              color="gray.800"
              _hover={{ bg: "white", transform: "rotate(90deg)" }}
              borderRadius="full"
              size="sm"
              aria-label="Close"
              transition="all 0.3s ease"
            />
          </Flex>

          <ModalBody p={0}>
            <Box display={{ md: "flex" }} h="full" minH="600px">
              {/* Left Side - Visual / Cover (40%) */}
              <Box
                w={{ base: "full", md: "40%" }}
                position="relative"
                bg="gray.100"
                transition="all 0.4s ease"
              >
                {isEditing ? (
                  // Edit Mode - Image Upload
                  <Box h="full" w="full" position="relative" group>
                    {editFormData.coverPhoto ? (
                      <Image
                        src={editFormData.coverPhoto}
                        w="full"
                        h="full"
                        objectFit="cover"
                        filter="brightness(0.9)"
                      />
                    ) : (
                      <Box
                        h="full"
                        w="full"
                        bgGradient="linear(to-br, gray.100, gray.200)"
                      />
                    )}

                    <Flex
                      position="absolute"
                      inset={0}
                      bg="blackAlpha.400"
                      align="center"
                      justify="center"
                      direction="column"
                      backdropFilter="blur(2px)"
                      transition="all 0.3s"
                    >
                      <VStack
                        bg="whiteAlpha.900"
                        p={8}
                        borderRadius="2xl"
                        boxShadow="2xl"
                        spacing={4}
                        transform="scale(0.95)"
                        _hover={{ transform: "scale(1)" }}
                        transition="all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                      >
                        <Box
                          p={4}
                          bg="green.50"
                          color="green.500"
                          borderRadius="full"
                        >
                          {uploading ? (
                            <Spinner />
                          ) : (
                            <Icon as={FiBriefcase} boxSize={6} />
                          )}
                        </Box>
                        <Text fontWeight="bold" fontSize="lg" color="gray.800">
                          {uploading ? "Uploading..." : "Change Cover Photo"}
                        </Text>
                        <Button
                          size="sm"
                          colorScheme="green"
                          onClick={() =>
                            document.getElementById("cover-upload-inc").click()
                          }
                        >
                          Select Image
                        </Button>
                        <Input
                          id="cover-upload-inc"
                          type="file"
                          accept="image/*"
                          display="none"
                          onChange={handleImageUpload}
                        />
                      </VStack>
                    </Flex>
                  </Box>
                ) : // View Mode - Hero Image
                selectedService?.coverPhoto ? (
                  <Image
                    src={selectedService.coverPhoto}
                    w="full"
                    h="full"
                    objectFit="cover"
                  />
                ) : (
                  <Flex
                    h="full"
                    w="full"
                    align="center"
                    justify="center"
                    bg="gray.100"
                    direction="column"
                  >
                    <Icon
                      as={FiBriefcase}
                      boxSize={16}
                      color="gray.300"
                      mb={4}
                    />
                    <Text color="gray.400" fontWeight="medium">
                      No Cover Photo
                    </Text>
                  </Flex>
                )}
              </Box>

              {/* Right Side - Content & Form (60%) */}
              <Box
                w={{ base: "full", md: "60%" }}
                p={{ base: 6, md: 10 }}
                bg="white"
                overflowY="auto"
                maxH={{ base: "auto", md: "85vh" }}
              >
                {isEditing ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSaveChanges();
                    }}
                    style={{ width: "100%" }}
                  >
                    <VStack align="stretch" spacing={8}>
                      <Box>
                        <Heading size="lg" mb={2} color="gray.800">
                          Edit Service
                        </Heading>
                        <Text color="gray.500">
                          Update your service details below.
                        </Text>
                      </Box>

                      <VStack spacing={5}>
                        <FormControl>
                          <FormLabel
                            fontSize="xs"
                            fontWeight="bold"
                            textTransform="uppercase"
                            color="gray.400"
                            mb={2}
                          >
                            Title
                          </FormLabel>
                          <Input
                            name="title"
                            value={editFormData.title}
                            onChange={handleInputChange}
                            variant="filled"
                            bg="gray.50"
                            _hover={{ bg: "gray.100" }}
                            _focus={{ bg: "white", borderColor: "green.500" }}
                            size="lg"
                            fontSize="xl"
                            fontWeight="bold"
                            borderRadius="xl"
                            h="60px"
                          />
                        </FormControl>

                        <HStack spacing={4}>
                          <FormControl>
                            <FormLabel
                              fontSize="xs"
                              fontWeight="bold"
                              textTransform="uppercase"
                              color="gray.400"
                              mb={2}
                            >
                              Price (AED/hr)
                            </FormLabel>
                            <Input
                              name="price"
                              type="number"
                              value={editFormData.price}
                              onChange={handleInputChange}
                              variant="filled"
                              bg="gray.50"
                              _hover={{ bg: "gray.100" }}
                              _focus={{ bg: "white", borderColor: "green.500" }}
                              size="lg"
                              borderRadius="xl"
                              h="50px"
                              fontWeight="medium"
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel
                              fontSize="xs"
                              fontWeight="bold"
                              textTransform="uppercase"
                              color="gray.400"
                              mb={2}
                            >
                              Location
                            </FormLabel>
                            <Input
                              name="location"
                              value={editFormData.location}
                              onChange={handleInputChange}
                              variant="filled"
                              bg="gray.50"
                              _hover={{ bg: "gray.100" }}
                              _focus={{ bg: "white", borderColor: "green.500" }}
                              size="lg"
                              borderRadius="xl"
                              h="50px"
                            />
                          </FormControl>
                        </HStack>

                        <FormControl>
                          <FormLabel
                            fontSize="xs"
                            fontWeight="bold"
                            textTransform="uppercase"
                            color="gray.400"
                            mb={2}
                          >
                            Description
                          </FormLabel>
                          <Textarea
                            name="description"
                            value={editFormData.description}
                            onChange={handleInputChange}
                            variant="filled"
                            bg="gray.50"
                            _hover={{ bg: "gray.100" }}
                            _focus={{ bg: "white", borderColor: "green.500" }}
                            size="lg"
                            borderRadius="xl"
                            minH="200px"
                            lineHeight="tall"
                            p={4}
                          />
                        </FormControl>
                      </VStack>

                      <HStack pt={4} spacing={4} justify="flex-end">
                        <Button
                          variant="ghost"
                          size="lg"
                          borderRadius="full"
                          onClick={() => setIsEditing(false)}
                          color="gray.500"
                        >
                          Cancel
                        </Button>
                        <Button
                          colorScheme="green"
                          size="lg"
                          borderRadius="full"
                          px={10}
                          bgGradient="linear(to-r, green.400, green.600)"
                          _hover={{
                            bgGradient: "linear(to-r, green.500, green.700)",
                            boxShadow: "xl",
                            transform: "translateY(-1px)",
                          }}
                          type="submit"
                          isLoading={isSaving}
                          boxShadow="lg"
                        >
                          Save Updates
                        </Button>
                      </HStack>
                    </VStack>
                  </form>
                ) : (
                  <VStack align="stretch" spacing={8}>
                    {/* Header Section */}
                    <Box>
                      <HStack spacing={3} mb={4}>
                        <Badge
                          colorScheme="green"
                          px={3}
                          py={1}
                          borderRadius="full"
                          textTransform="uppercase"
                          letterSpacing="wider"
                          fontWeight="bold"
                          fontSize="xx-small"
                          bg="green.50"
                          color="green.600"
                        >
                          {selectedService?.categoryName}
                        </Badge>
                        <Badge
                          colorScheme={
                            selectedService?.status === "ACTIVE"
                              ? "blue"
                              : "gray"
                          }
                          px={3}
                          py={1}
                          borderRadius="full"
                          fontSize="xx-small"
                          variant="subtle"
                        >
                          {selectedService?.status}
                        </Badge>
                      </HStack>

                      <Heading
                        size="2xl"
                        lineHeight="shorter"
                        color="gray.900"
                        fontWeight="800"
                        letterSpacing="tight"
                      >
                        {selectedService?.title}
                      </Heading>
                    </Box>

                    {/* Stats Grid */}
                    <SimpleGrid columns={2} spacing={4}>
                      <Box
                        p={5}
                        bg="gray.50"
                        borderRadius="2xl"
                        _hover={{ bg: "green.50", cursor: "default" }}
                        transition="all 0.3s"
                      >
                        <Text
                          fontSize="xs"
                          fontWeight="bold"
                          textTransform="uppercase"
                          color="gray.400"
                          mb={1}
                          letterSpacing="wide"
                        >
                          Hourly Rate
                        </Text>
                        <Text fontSize="2xl" fontWeight="800" color="green.600">
                          AED {selectedService?.price}
                        </Text>
                      </Box>
                      <Box
                        p={5}
                        bg="gray.50"
                        borderRadius="2xl"
                        _hover={{ bg: "orange.50", cursor: "default" }}
                        transition="all 0.3s"
                      >
                        <Text
                          fontSize="xs"
                          fontWeight="bold"
                          textTransform="uppercase"
                          color="gray.400"
                          mb={1}
                          letterSpacing="wide"
                        >
                          Rating
                        </Text>
                        <HStack>
                          <Text
                            fontSize="2xl"
                            fontWeight="800"
                            color="gray.800"
                          >
                            {selectedService?.rating > 0
                              ? selectedService?.rating
                              : "New"}
                          </Text>
                          {selectedService?.rating > 0 && (
                            <Icon
                              as={FiBriefcase}
                              color="orange.400"
                              boxSize={5}
                            />
                          )}
                        </HStack>
                      </Box>
                    </SimpleGrid>

                    {/* Location */}
                    <Flex
                      align="center"
                      color="gray.600"
                      bg="white"
                      p={3}
                      borderRadius="xl"
                      border="1px dashed"
                      borderColor="gray.200"
                    >
                      <Icon as={FiMapPin} mr={3} color="green.500" />
                      <Text fontWeight="medium">
                        {selectedService?.location || "Remote Available"}
                      </Text>
                    </Flex>

                    {/* Description */}
                    <Box>
                      <Text
                        fontSize="lg"
                        fontWeight="bold"
                        color="gray.800"
                        mb={3}
                      >
                        About this Service
                      </Text>
                      <Text
                        color="gray.600"
                        fontSize="lg"
                        lineHeight="1.8"
                        whiteSpace="pre-wrap"
                      >
                        {selectedService?.description}
                      </Text>
                    </Box>
                  </VStack>
                )}
              </Box>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
