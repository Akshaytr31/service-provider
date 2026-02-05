"use client";

import {
  Box,
  Heading,
  Text,
  Stack,
  Avatar,
  Flex,
  IconButton,
  Input,
  Button,
  Divider,
  FormControl,
  FormLabel,
  Container,
  Grid,
  GridItem,
  useToast,
  Select,
  Tag,
  VStack,
  HStack,
  Icon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  TagLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Link,
  Textarea,
  Spinner,
  Image,
} from "@chakra-ui/react";
import {
  EditIcon,
  CheckIcon,
  CloseIcon,
  InfoIcon,
  PhoneIcon,
  AtSignIcon,
  TimeIcon,
  LinkIcon,
  AddIcon,
} from "@chakra-ui/icons";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiBriefcase,
  FiMapPin,
  FiDollarSign,
  FiGlobe,
  FiSmartphone,
  FiMail,
  FiUser,
  FiCamera,
  FiImage,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import dynamic from "next/dynamic";

const GoogleMap = dynamic(() => import("../components/googleMap/GoogleMap"), {
  ssr: false,
});

const MotionBox = motion(Box);

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const user = session?.user;
  const toast = useToast();

  const [categories, setCategories] = useState([]); // Added categories state

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const json = await res.json();
      setCategories(json.categories || json);
    } catch (err) {
      console.error("Fetch categories failed", err);
    }
  };

  // Share functionality
  const handleShare = () => {
    if (!user?.id) return;
    const shareUrl = `${window.location.origin}/profile/${user.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link Copied!",
      description: "Profile link copied to clipboard.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [providerRequest, setProviderRequest] = useState(null);
  const [isProviderAtFirst, setIsProviderAtFirst] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    gender: "",
    dob: "",
    city: "",
    state: "",
    country: "",
    address: "",
    zipCode: "",
    userType: "individual",
    businessName: "",
    businessType: "",
  });

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/seeker/profile");
      const data = await res.json();
      console.log(data);

      const profileData = data.profile || {};
      const userData = data.user || {}; // From API
      const requestData = data.providerRequest || null;

      setProfile(profileData);
      setProviderRequest(requestData);
      setIsProviderAtFirst(userData.isProviderAtFirst || false);

      // Helper to split name if profile name is missing
      const splitName = (fullName) => {
        const parts = (fullName || "").trim().split(" ");
        return {
          firstName: parts[0] || "",
          lastName: parts.slice(1).join(" ") || "",
        };
      };

      const { firstName: userFirst, lastName: userLast } = splitName(
        userData.name,
      );

      setForm({
        firstName: profileData.firstName || userFirst || "",
        lastName: profileData.lastName || userLast || "",
        email: userData.email || user?.email || "",
        mobile: userData.mobile || user?.mobile || "",
        gender: profileData.gender || "",
        dob: profileData.dateOfBirth || userData.dateOfBirth || "",
        city: profileData.city || "",
        state: profileData.state || "",
        country: profileData.country || "",
        address: profileData.address || "",
        zipCode: profileData.zipCode || "",
        userType: profileData.userType || "individual",
        businessName: profileData.businessName || "",
        businessType: profileData.businessType || "",
      });

      // Initialize provider form if request exists
      if (requestData) {
        setProviderForm({
          profilePhoto: requestData.profilePhoto || "",
          bannerPhoto: requestData.bannerPhoto || "",
          gallery: Array.isArray(requestData.gallery)
            ? requestData.gallery
            : [],
          firstName: requestData.firstName || "",
          lastName: requestData.lastName || "",
          businessName: requestData.businessName || "",
          businessType: requestData.businessType || "",
          registrationNumber: requestData.registrationNumber || "",
          trnNumber: requestData.trnNumber || "",
          establishmentYear: requestData.establishmentYear || "",
          businessExpiryDate: requestData.businessExpiryDate || "",
          description: requestData.description || "",
          serviceRadius: requestData.serviceRadius || "",
          yearsExperience: requestData.yearsExperience || "",
          categoryId: requestData.categoryId || "",
          subCategoryId: requestData.subCategoryId || "",
          pricingType: requestData.pricingType || "",
          baseRate: requestData.baseRate || "",
          onSiteCharges: requestData.onSiteCharges || "",
          address: requestData.address || "",
          city: requestData.city || "",
          state: requestData.state || "",
          country: requestData.country || "",
          zipCode: requestData.zipCode || "",
          latitude: requestData.latitude || "",
          longitude: requestData.longitude || "",
          idType: requestData.idType || "",
          idNumber: requestData.idNumber || "",
          servicesOffered: requestData.servicesOffered || [],
        });
      }
    } catch (err) {
      console.error("Failed to fetch profile", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchCategories();
    }
  }, [user]);

  // Provider Form State
  const [providerForm, setProviderForm] = useState({});

  const handleProviderSave = async () => {
    try {
      const res = await fetch("/api/provider/request", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(providerForm),
      });

      if (res.ok) {
        toast({
          title: "Provider Profile Updated",
          status: "success",
          duration: 3000,
        });
        setIsEditing(false);
        fetchProfile();
      } else {
        throw new Error("Failed to update provider profile");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "provider-assets");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      const imageUrl = data.secureUrl;

      // Update local state immediately
      let updatedForm = { ...providerForm };

      if (field === "gallery") {
        const newGallery = [...(providerForm.gallery || []), imageUrl];
        updatedForm = { ...providerForm, gallery: newGallery };
      } else {
        updatedForm = { ...providerForm, [field]: imageUrl };
      }

      setProviderForm(updatedForm);

      // Persist immediately
      const payload = {};
      if (field === "gallery") {
        payload.gallery = updatedForm.gallery;
      } else {
        payload[field] = imageUrl;
      }

      const saveRes = await fetch("/api/provider/request", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!saveRes.ok) throw new Error("Failed to save changes");

      // Update the requestData/profileData context effectively by refetching or just rely on local state?
      // For now, local state + toast is good.

      toast({
        title: "Success",
        description: "Image uploaded and saved.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to upload image.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveGalleryImage = async (index) => {
    const newGallery = providerForm.gallery.filter((_, i) => i !== index);
    setProviderForm({ ...providerForm, gallery: newGallery });

    try {
      const saveRes = await fetch("/api/provider/request", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gallery: newGallery }),
      });

      if (!saveRes.ok) throw new Error("Failed to save gallery update");

      toast({
        title: "Success",
        description: "Image removed.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to remove image.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch("/api/seeker/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast({
          title: "Profile updated",
          status: "success",
          duration: 3000,
        });
        setIsEditing(false);
        fetchProfile();
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      setForm({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: user?.email || "",
        mobile: user?.mobile || "",
        gender: profile.gender || "",
        dob: profile.dateOfBirth || "",
        city: profile.city || "",
        state: profile.state || "",
        country: profile.country || "",
        address: profile.address || "",
        zipCode: profile.zipCode || "",
        userType: profile.userType || "individual",
        businessName: profile.businessName || "",
        businessType: profile.businessType || "",
      });
    }
  };

  if (!user) return null;

  const SectionHeader = ({ title, icon }) => (
    <HStack spacing={3} mb={4} mt={6}>
      <Icon as={icon} color="green.500" />
      <Heading
        size="sm"
        color="gray.700"
        textTransform="uppercase"
        letterSpacing="widest"
      >
        {title}
      </Heading>
    </HStack>
  );

  const DisplayField = ({ label, value }) => (
    <Box>
      <Text
        fontSize="xs"
        color="gray.400"
        fontWeight="bold"
        textTransform="uppercase"
        mb={1}
      >
        {label}
      </Text>
      <Text fontSize="md" color="gray.700" fontWeight="medium">
        {value || "Not provided"}
      </Text>
    </Box>
  );

  return (
    <Box
      minH="100vh"
      bg="gray.50"
      pt="100px"
      pb={20}
      position="relative"
      overflow="hidden"
    >
      {/* Decorative background elements */}
      <Box
        position="absolute"
        top="-10%"
        right="-5%"
        w="40%"
        h="40%"
        bgGradient="radial(green.50, transparent)"
        filter="blur(80px)"
        zIndex={0}
      />

      <Container maxW="container.lg" position="relative" zIndex={1}>
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Tabs variant="soft-rounded" colorScheme="green" isLazy>
            <TabPanels>
              {!isProviderAtFirst && (
                <TabPanel p={0}>
                  <Box
                    bg="white"
                    p={8}
                    borderRadius="3xl"
                    boxShadow="0 10px 30px rgba(0,0,0,0.05)"
                    border="1px solid"
                    borderColor="gray.100"
                  >
                    <AnimatePresence mode="wait">
                      {!isEditing ? (
                        <Stack spacing={8}>
                          {/* Basic Information */}
                          <Box>
                            <SectionHeader
                              title="Basic Information"
                              icon={InfoIcon}
                            />
                            <Grid
                              templateColumns={{
                                base: "1fr",
                                md: "repeat(2, 1fr)",
                              }}
                              gap={6}
                            >
                              <DisplayField
                                label="First Name"
                                value={form.firstName}
                              />
                              <DisplayField
                                label="Last Name"
                                value={form.lastName}
                              />
                              <DisplayField
                                label="Gender"
                                value={form.gender}
                              />
                              <DisplayField
                                label="Date of Birth"
                                value={form.dob}
                              />
                              <DisplayField
                                label="Mobile"
                                value={form.mobile}
                              />
                            </Grid>
                          </Box>

                          <Divider borderColor="gray.100" />

                          {/* Business Details (If applicable) */}
                          {form.userType === "business" && (
                            <Box>
                              <SectionHeader
                                title="Business Details"
                                icon={AtSignIcon}
                              />
                              <Grid
                                templateColumns={{
                                  base: "1fr",
                                  md: "repeat(2, 1fr)",
                                }}
                                gap={6}
                              >
                                <DisplayField
                                  label="Business Name"
                                  value={form.businessName}
                                />
                                <DisplayField
                                  label="Business Type"
                                  value={form.businessType}
                                />
                              </Grid>
                              <Divider borderColor="gray.100" mt={8} />
                            </Box>
                          )}

                          {/* Contact & Location */}
                          <Box>
                            <SectionHeader
                              title="Location Details"
                              icon={PhoneIcon}
                            />
                            <Grid
                              templateColumns={{
                                base: "1fr",
                                md: "repeat(2, 1fr)",
                              }}
                              gap={6}
                            >
                              <GridItem colSpan={{ base: 1, md: 2 }}>
                                <DisplayField
                                  label="Address"
                                  value={form.address}
                                />
                              </GridItem>
                              <DisplayField label="City" value={form.city} />
                              <DisplayField label="State" value={form.state} />
                              <DisplayField
                                label="Country"
                                value={form.country}
                              />
                              <DisplayField
                                label="Zip Code"
                                value={form.zipCode}
                              />
                            </Grid>
                          </Box>
                        </Stack>
                      ) : (
                        <Stack spacing={6}>
                          <SectionHeader
                            title="Edit Profile Details"
                            icon={EditIcon}
                          />

                          <Grid
                            templateColumns={{
                              base: "1fr",
                              md: "repeat(2, 1fr)",
                            }}
                            gap={6}
                          >
                            <FormControl>
                              <FormLabel fontSize="sm" color="gray.600">
                                First Name
                              </FormLabel>
                              <Input
                                value={form.firstName}
                                onChange={(e) =>
                                  setForm({
                                    ...form,
                                    firstName: e.target.value,
                                  })
                                }
                                borderRadius="xl"
                                focusBorderColor="green.400"
                              />
                            </FormControl>

                            <FormControl>
                              <FormLabel fontSize="sm" color="gray.600">
                                Last Name
                              </FormLabel>
                              <Input
                                value={form.lastName}
                                onChange={(e) =>
                                  setForm({ ...form, lastName: e.target.value })
                                }
                                borderRadius="xl"
                                focusBorderColor="green.400"
                              />
                            </FormControl>

                            <FormControl>
                              <FormLabel fontSize="sm" color="gray.600">
                                Gender
                              </FormLabel>
                              <Select
                                value={form.gender}
                                onChange={(e) =>
                                  setForm({ ...form, gender: e.target.value })
                                }
                                borderRadius="xl"
                                focusBorderColor="green.400"
                              >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                              </Select>
                            </FormControl>

                            <FormControl>
                              <FormLabel fontSize="sm" color="gray.600">
                                Date of Birth
                              </FormLabel>
                              <Input
                                type="date"
                                value={form.dob}
                                onChange={(e) =>
                                  setForm({ ...form, dob: e.target.value })
                                }
                                borderRadius="xl"
                                focusBorderColor="green.400"
                              />
                            </FormControl>

                            <FormControl>
                              <FormLabel fontSize="sm" color="gray.600">
                                Mobile
                              </FormLabel>
                              <Input
                                value={form.mobile}
                                onChange={(e) =>
                                  setForm({ ...form, mobile: e.target.value })
                                }
                                borderRadius="xl"
                                focusBorderColor="green.400"
                              />
                            </FormControl>

                            <GridItem colSpan={{ base: 1, md: 2 }}>
                              <FormControl>
                                <FormLabel fontSize="sm" color="gray.600">
                                  Address
                                </FormLabel>
                                <Input
                                  value={form.address}
                                  onChange={(e) =>
                                    setForm({
                                      ...form,
                                      address: e.target.value,
                                    })
                                  }
                                  borderRadius="xl"
                                  focusBorderColor="green.400"
                                />
                              </FormControl>
                            </GridItem>

                            <FormControl>
                              <FormLabel fontSize="sm" color="gray.600">
                                City
                              </FormLabel>
                              <Input
                                value={form.city}
                                onChange={(e) =>
                                  setForm({ ...form, city: e.target.value })
                                }
                                borderRadius="xl"
                                focusBorderColor="green.400"
                              />
                            </FormControl>

                            <FormControl>
                              <FormLabel fontSize="sm" color="gray.600">
                                State
                              </FormLabel>
                              <Input
                                value={form.state}
                                onChange={(e) =>
                                  setForm({ ...form, state: e.target.value })
                                }
                                borderRadius="xl"
                                focusBorderColor="green.400"
                              />
                            </FormControl>

                            <FormControl>
                              <FormLabel fontSize="sm" color="gray.600">
                                Country
                              </FormLabel>
                              <Input
                                value={form.country}
                                onChange={(e) =>
                                  setForm({ ...form, country: e.target.value })
                                }
                                borderRadius="xl"
                                focusBorderColor="green.400"
                              />
                            </FormControl>

                            <FormControl>
                              <FormLabel fontSize="sm" color="gray.600">
                                Zip Code
                              </FormLabel>
                              <Input
                                value={form.zipCode}
                                onChange={(e) =>
                                  setForm({ ...form, zipCode: e.target.value })
                                }
                                borderRadius="xl"
                                focusBorderColor="green.400"
                              />
                            </FormControl>
                          </Grid>

                          <Box pt={6}>
                            <Button
                              w="full"
                              colorScheme="green"
                              size="lg"
                              borderRadius="2xl"
                              onClick={handleSave}
                              boxShadow="0 10px 20px rgba(72, 187, 120, 0.2)"
                            >
                              Save All Changes
                            </Button>
                          </Box>
                        </Stack>
                      )}
                    </AnimatePresence>
                  </Box>
                </TabPanel>
              )}

              {providerRequest && (
                <TabPanel p={0}>
                  <Box position="relative" mb={16}>
                    <Box
                      h="300px"
                      w="full"
                      bgGradient="linear(to-r, green.400, teal.500)"
                      overflow="hidden"
                      position="relative"
                      borderRadius="xl"
                    >
                      {providerForm.bannerPhoto ? (
                        <Image
                          src={providerForm.bannerPhoto}
                          alt="Banner"
                          w="full"
                          h="full"
                          objectFit="cover"
                        />
                      ) : null}
                      <Box position="absolute" top={4} right={4}>
                        <Box
                          as="label"
                          htmlFor="bannerInput"
                          cursor="pointer"
                          bg="whiteAlpha.800"
                          p={2}
                          borderRadius="full"
                          _hover={{ bg: "white" }}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          {uploading ? (
                            <Spinner size="sm" />
                          ) : (
                            <Icon as={FiCamera} boxSize={5} color="gray.700" />
                          )}
                        </Box>
                        <Input
                          id="bannerInput"
                          type="file"
                          accept="image/*"
                          display="none"
                          onChange={(e) => handleImageUpload(e, "bannerPhoto")}
                        />
                      </Box>
                    </Box>

                    <Box position="absolute" bottom="-40px" left={8}>
                      <Box position="relative">
                        <Avatar
                          size="2xl"
                          src={providerForm.profilePhoto}
                          border="4px solid white"
                          bg="white"
                          name={providerForm.firstName}
                        />
                        <Box
                          position="absolute"
                          bottom={0}
                          right={0}
                          zIndex={2}
                        >
                          <Box
                            as="label"
                            htmlFor="profileInput"
                            cursor="pointer"
                            bg="white"
                            color="gray.700"
                            p={2}
                            borderRadius="full"
                            boxShadow="md"
                            border="1px solid"
                            borderColor="gray.200"
                            _hover={{ bg: "gray.50" }}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                          >
                            {uploading ? (
                              <Spinner size="xs" />
                            ) : (
                              <Icon as={FiCamera} boxSize={4} />
                            )}
                          </Box>
                          <Input
                            id="profileInput"
                            type="file"
                            accept="image/*"
                            display="none"
                            onChange={(e) =>
                              handleImageUpload(e, "profilePhoto")
                            }
                          />
                        </Box>
                      </Box>
                    </Box>
                    {/* Header Card */}
                    <Box mt={3} pl={{ base: 4, md: "170px" }} pr={4}>
                      <Flex
                        direction={{ base: "column", md: "row" }}
                        justify="space-between"
                        align={{ base: "start", md: "center" }}
                        gap={4}
                        marginTop={"-0.5rem"}
                      >
                        <Stack spacing={1}>
                          <Heading size="2xl" fontWeight="800" color="gray.800">
                            {providerForm.firstName || providerForm.lastName
                              ? `${providerForm.firstName} ${providerForm.lastName}`
                              : user.name || "User"}
                          </Heading>
                          <HStack spacing={2} wrap="wrap">
                            <Tag
                              size="md"
                              colorScheme="green"
                              variant="subtle"
                              borderRadius="full"
                              px={3}
                              fontWeight="bold"
                            >
                              {user.role?.toUpperCase()}
                            </Tag>
                            {profile?.userType && (
                              <Tag
                                size="md"
                                colorScheme="blue"
                                variant="subtle"
                                borderRadius="full"
                                px={3}
                                fontWeight="bold"
                              >
                                {profile.userType.toUpperCase()}
                              </Tag>
                            )}
                          </HStack>
                        </Stack>

                        <HStack
                          spacing={3}
                          mt={{ base: 4, md: 0 }}
                          width={{ base: "full", md: "auto" }}
                        >
                          {!isEditing && (
                            <Button
                              leftIcon={<LinkIcon />}
                              variant="ghost"
                              colorScheme="blue"
                              onClick={handleShare}
                              size="md"
                              borderRadius="xl"
                              _hover={{ bg: "blue.50" }}
                            >
                              Share
                            </Button>
                          )}

                          {!isEditing && (
                            <Button
                              leftIcon={<EditIcon />}
                              colorScheme="green"
                              onClick={() => setIsEditing(true)}
                              size="md"
                              borderRadius="xl"
                              boxShadow="md"
                              _hover={{
                                transform: "translateY(-1px)",
                                boxShadow: "lg",
                              }}
                              transition="all 0.2s"
                            >
                              Edit Profile
                            </Button>
                          )}

                          {isEditing && (
                            <HStack
                              spacing={2}
                              width="full"
                              justify={{ base: "flex-end", md: "flex-start" }}
                            >
                              <Button
                                leftIcon={<CloseIcon />}
                                variant="ghost"
                                onClick={handleCancel}
                                borderRadius="xl"
                                colorScheme="gray"
                              >
                                Cancel
                              </Button>
                              <Button
                                leftIcon={<CheckIcon />}
                                colorScheme="green"
                                onClick={handleProviderSave}
                                borderRadius="xl"
                                boxShadow="lg"
                              >
                                Save Changes
                              </Button>
                            </HStack>
                          )}
                        </HStack>
                      </Flex>
                    </Box>
                  </Box>
                  {!isProviderAtFirst && providerRequest && (
                    <TabList mb={6}>
                      {!isProviderAtFirst && (
                        <Tab
                          fontWeight="bold"
                          borderRadius="xl"
                          _selected={{ color: "white", bg: "green.500" }}
                        >
                          Seeker Profile
                        </Tab>
                      )}
                      {providerRequest && (
                        <Tab
                          fontWeight="bold"
                          borderRadius="xl"
                          _selected={{ color: "white", bg: "green.500" }}
                        >
                          Provider Profile
                        </Tab>
                      )}
                    </TabList>
                  )}

                  <Box
                    bg="white"
                    p={8}
                    borderRadius="3xl"
                    boxShadow="0 10px 30px rgba(0,0,0,0.05)"
                    border="1px solid"
                    borderColor="gray.100"
                  >
                    <Flex justify="space-between" align="center" mb={6}>
                      <HStack>
                        <Icon as={FiBriefcase} color="green.500" boxSize={6} />
                        <Heading size="md" color="gray.700">
                          Provider Application Details
                        </Heading>
                      </HStack>
                      <HStack>
                        {isEditing && (
                          <Button
                            colorScheme="green"
                            onClick={handleProviderSave}
                            size="sm"
                            borderRadius="lg"
                          >
                            Save Provider Changes
                          </Button>
                        )}
                        <Badge
                          colorScheme={
                            providerRequest.status === "APPROVED"
                              ? "green"
                              : providerRequest.status === "REJECTED"
                                ? "red"
                                : "orange"
                          }
                          px={3}
                          py={1}
                          borderRadius="full"
                          fontSize="sm"
                        >
                          {providerRequest.status}
                        </Badge>
                      </HStack>
                    </Flex>

                    <Stack spacing={8}>
                      {/* Identity Section */}
                      <Box>
                        <SectionHeader
                          title={
                            providerRequest.userType === "business"
                              ? "Business Details"
                              : "Personal Details"
                          }
                          icon={FiUser}
                        />
                        <Grid
                          templateColumns={{
                            base: "1fr",
                            md: "repeat(2, 1fr)",
                          }}
                          gap={6}
                        >
                          <DisplayField
                            label="Provider Type"
                            value={
                              providerRequest.userType === "business"
                                ? "Business Entity"
                                : "Individual Provider"
                            }
                          />

                          {providerRequest.userType === "business" ? (
                            <>
                              {isEditing ? (
                                <>
                                  <FormControl>
                                    <FormLabel
                                      fontSize="xs"
                                      fontWeight="bold"
                                      color="gray.500"
                                    >
                                      Business Name
                                    </FormLabel>
                                    <Input
                                      value={providerForm.businessName}
                                      onChange={(e) =>
                                        setProviderForm({
                                          ...providerForm,
                                          businessName: e.target.value,
                                        })
                                      }
                                      borderRadius="xl"
                                    />
                                  </FormControl>
                                  <FormControl>
                                    <FormLabel
                                      fontSize="xs"
                                      fontWeight="bold"
                                      color="gray.500"
                                    >
                                      Business Type
                                    </FormLabel>
                                    <Input
                                      value={providerForm.businessType}
                                      onChange={(e) =>
                                        setProviderForm({
                                          ...providerForm,
                                          businessType: e.target.value,
                                        })
                                      }
                                      borderRadius="xl"
                                    />
                                  </FormControl>
                                  <FormControl>
                                    <FormLabel
                                      fontSize="xs"
                                      fontWeight="bold"
                                      color="gray.500"
                                    >
                                      Registration Number
                                    </FormLabel>
                                    <Input
                                      value={providerForm.registrationNumber}
                                      onChange={(e) =>
                                        setProviderForm({
                                          ...providerForm,
                                          registrationNumber: e.target.value,
                                        })
                                      }
                                      borderRadius="xl"
                                    />
                                  </FormControl>
                                  <FormControl>
                                    <FormLabel
                                      fontSize="xs"
                                      fontWeight="bold"
                                      color="gray.500"
                                    >
                                      TRN Number
                                    </FormLabel>
                                    <Input
                                      value={providerForm.trnNumber}
                                      onChange={(e) =>
                                        setProviderForm({
                                          ...providerForm,
                                          trnNumber: e.target.value,
                                        })
                                      }
                                      borderRadius="xl"
                                    />
                                  </FormControl>
                                  <FormControl>
                                    <FormLabel
                                      fontSize="xs"
                                      fontWeight="bold"
                                      color="gray.500"
                                    >
                                      Establishment Year
                                    </FormLabel>
                                    <Input
                                      value={providerForm.establishmentYear}
                                      onChange={(e) =>
                                        setProviderForm({
                                          ...providerForm,
                                          establishmentYear: e.target.value,
                                        })
                                      }
                                      borderRadius="xl"
                                    />
                                  </FormControl>
                                  <FormControl>
                                    <FormLabel
                                      fontSize="xs"
                                      fontWeight="bold"
                                      color="gray.500"
                                    >
                                      Expiry Date
                                    </FormLabel>
                                    <Input
                                      type="date"
                                      value={providerForm.businessExpiryDate}
                                      onChange={(e) =>
                                        setProviderForm({
                                          ...providerForm,
                                          businessExpiryDate: e.target.value,
                                        })
                                      }
                                      borderRadius="xl"
                                    />
                                  </FormControl>
                                </>
                              ) : (
                                <>
                                  <DisplayField
                                    label="Business Name"
                                    value={providerRequest.businessName}
                                  />
                                  <DisplayField
                                    label="Business Type"
                                    value={providerRequest.businessType}
                                  />
                                  <DisplayField
                                    label="Registration Number"
                                    value={providerRequest.registrationNumber}
                                  />
                                  <DisplayField
                                    label="TRN Number"
                                    value={providerRequest.trnNumber}
                                  />
                                  <DisplayField
                                    label="Establishment Year"
                                    value={providerRequest.establishmentYear}
                                  />
                                  <DisplayField
                                    label="Expiry Date"
                                    value={providerRequest.businessExpiryDate}
                                  />
                                </>
                              )}
                            </>
                          ) : (
                            <>
                              {isEditing ? (
                                <>
                                  <FormControl>
                                    <FormLabel
                                      fontSize="xs"
                                      fontWeight="bold"
                                      color="gray.500"
                                    >
                                      First Name
                                    </FormLabel>
                                    <Input
                                      value={providerForm.firstName}
                                      onChange={(e) =>
                                        setProviderForm({
                                          ...providerForm,
                                          firstName: e.target.value,
                                        })
                                      }
                                      borderRadius="xl"
                                    />
                                  </FormControl>
                                  <FormControl>
                                    <FormLabel
                                      fontSize="xs"
                                      fontWeight="bold"
                                      color="gray.500"
                                    >
                                      Last Name
                                    </FormLabel>
                                    <Input
                                      value={providerForm.lastName}
                                      onChange={(e) =>
                                        setProviderForm({
                                          ...providerForm,
                                          lastName: e.target.value,
                                        })
                                      }
                                      borderRadius="xl"
                                    />
                                  </FormControl>
                                  <GridItem colSpan={{ base: 1, md: 2 }}>
                                    <FormControl>
                                      <FormLabel
                                        fontSize="xs"
                                        fontWeight="bold"
                                        color="gray.500"
                                      >
                                        ID Type
                                      </FormLabel>
                                      <Select
                                        value={providerForm.idType}
                                        onChange={(e) =>
                                          setProviderForm({
                                            ...providerForm,
                                            idType: e.target.value,
                                          })
                                        }
                                        borderRadius="xl"
                                      >
                                        <option value="Passport">
                                          Passport
                                        </option>
                                        <option value="Driving License">
                                          Driving License
                                        </option>
                                        <option value="National ID">
                                          National ID
                                        </option>
                                      </Select>
                                    </FormControl>
                                  </GridItem>
                                  <GridItem colSpan={{ base: 1, md: 2 }}>
                                    <FormControl>
                                      <FormLabel
                                        fontSize="xs"
                                        fontWeight="bold"
                                        color="gray.500"
                                      >
                                        ID Number
                                      </FormLabel>
                                      <Input
                                        value={providerForm.idNumber}
                                        onChange={(e) =>
                                          setProviderForm({
                                            ...providerForm,
                                            idNumber: e.target.value,
                                          })
                                        }
                                        borderRadius="xl"
                                      />
                                    </FormControl>
                                  </GridItem>
                                </>
                              ) : (
                                <DisplayField
                                  label="Full Name"
                                  value={`${providerRequest.firstName || ""} ${providerRequest.lastName || ""}`}
                                />
                              )}
                              <DisplayField
                                label="Date of Birth"
                                value={providerRequest.dateOfBirth}
                              />
                              <DisplayField
                                label="Gender"
                                value={providerRequest.gender}
                              />
                              {!isEditing && (
                                <>
                                  <DisplayField
                                    label="ID Type"
                                    value={providerRequest.idType}
                                  />
                                  <DisplayField
                                    label="ID Number"
                                    value={providerRequest.idNumber}
                                  />
                                </>
                              )}
                            </>
                          )}
                        </Grid>
                      </Box>

                      <Divider borderColor="gray.100" />

                      {/* Service Details */}
                      <Box>
                        <SectionHeader
                          title="Service Details"
                          icon={FiBriefcase}
                        />
                        <Stack spacing={6}>
                          {(function () {
                            // Construct the unified list of services based on mode
                            const rootService = isEditing
                              ? {
                                  categoryId: providerForm.categoryId,
                                  subCategoryId: providerForm.subCategoryId,
                                  yearsExperience: providerForm.yearsExperience,
                                  description: providerForm.description,
                                  serviceRadius: providerForm.serviceRadius,
                                  extraSkills: providerForm.skills || [],
                                  isRoot: true,
                                }
                              : {
                                  categoryId: providerRequest.categoryId,
                                  subCategoryId: providerRequest.subCategoryId,
                                  yearsExperience:
                                    providerRequest.yearsExperience,
                                  description: providerRequest.description,
                                  serviceRadius: providerRequest.serviceRadius,
                                  extraSkills: providerRequest.skills || [],
                                  isRoot: true,
                                };

                            const otherServicesRaw = isEditing
                              ? providerForm.servicesOffered || []
                              : providerRequest.servicesOffered || [];

                            const globalRadius = isEditing
                              ? providerForm.serviceRadius
                              : providerRequest.serviceRadius;

                            // Filter out the "root" service and inject global serviceRadius
                            const otherServices = otherServicesRaw
                              .filter((s) => {
                                const isSameCategory =
                                  Number(s.categoryId) ===
                                  Number(rootService.categoryId);
                                const isSameSubCategory =
                                  Number(s.subCategoryId) ===
                                  Number(rootService.subCategoryId);
                                return !(isSameCategory && isSameSubCategory);
                              })
                              .map((s) => ({
                                ...s,
                                serviceRadius: globalRadius,
                              }));

                            const allServices = [rootService, ...otherServices];

                            return allServices.map((service, index) => {
                              // Helper to find category/subcategory usage
                              const catId = service.categoryId;
                              const subCatId = service.subCategoryId;

                              const category = categories.find(
                                (c) => c.id === Number(catId),
                              );
                              const subCategory = category?.subCategories?.find(
                                (s) => s.id === Number(subCatId),
                              );
                              const isRoot = index === 0;

                              return (
                                <Box
                                  key={index}
                                  p={5}
                                  bg="gray.50"
                                  borderRadius="2xl"
                                  border="1px solid"
                                  borderColor="gray.100"
                                >
                                  <HStack justify="space-between" mb={4}>
                                    <Text
                                      fontWeight="bold"
                                      color="green.600"
                                      fontSize="sm"
                                    >
                                      Service #{index + 1}
                                    </Text>
                                    <Badge
                                      colorScheme="green"
                                      variant="subtle"
                                      borderRadius="full"
                                      px={3}
                                    >
                                      {category?.name || "Unknown Category"}
                                    </Badge>
                                  </HStack>

                                  <Grid
                                    templateColumns={{
                                      base: "1fr",
                                      md: "repeat(2, 1fr)",
                                    }}
                                    gap={5}
                                  >
                                    {/* Category - Always Read Only */}
                                    <Box>
                                      <Text
                                        fontSize="xs"
                                        fontWeight="bold"
                                        color="gray.400"
                                        textTransform="uppercase"
                                        mb={1}
                                      >
                                        Category
                                      </Text>
                                      <Text fontSize="sm" fontWeight="bold">
                                        {category?.name ||
                                          service.categoryId ||
                                          "-"}
                                      </Text>
                                    </Box>

                                    {/* Sub-Category - Always Read Only */}
                                    <Box>
                                      <Text
                                        fontSize="xs"
                                        fontWeight="bold"
                                        color="gray.400"
                                        textTransform="uppercase"
                                        mb={1}
                                      >
                                        Sub-Category
                                      </Text>
                                      <Text fontSize="sm" fontWeight="bold">
                                        {subCategory?.name ||
                                          service.subCategoryId ||
                                          "-"}
                                      </Text>
                                    </Box>

                                    {/* Service Radius - For All Services */}
                                    <Box>
                                      {isEditing ? (
                                        <FormControl>
                                          <FormLabel
                                            fontSize="xs"
                                            fontWeight="bold"
                                            color="gray.500"
                                          >
                                            Service Radius (KM)
                                          </FormLabel>
                                          <Input
                                            type="number"
                                            value={
                                              service.serviceRadius ||
                                              providerForm.serviceRadius
                                            } // Use service prop or fallback to global form
                                            onChange={(e) =>
                                              setProviderForm({
                                                ...providerForm,
                                                serviceRadius: e.target.value,
                                              })
                                            }
                                            borderRadius="xl"
                                            bg="white"
                                          />
                                        </FormControl>
                                      ) : (
                                        <>
                                          <Text
                                            fontSize="xs"
                                            fontWeight="bold"
                                            color="gray.400"
                                            textTransform="uppercase"
                                            mb={1}
                                          >
                                            Service Radius
                                          </Text>
                                          <Text fontSize="sm" fontWeight="bold">
                                            {service.serviceRadius
                                              ? `${service.serviceRadius} km`
                                              : "N/A"}
                                          </Text>
                                        </>
                                      )}
                                    </Box>

                                    {/* Years of Experience */}
                                    <Box>
                                      {isEditing ? (
                                        <FormControl>
                                          <FormLabel
                                            fontSize="xs"
                                            fontWeight="bold"
                                            color="gray.500"
                                          >
                                            Years of Experience
                                          </FormLabel>
                                          <Input
                                            value={service.yearsExperience}
                                            onChange={(e) => {
                                              const val = e.target.value;
                                              if (isRoot) {
                                                setProviderForm({
                                                  ...providerForm,
                                                  yearsExperience: val,
                                                });
                                              } else {
                                                const newServices = [
                                                  ...(providerForm.servicesOffered ||
                                                    []),
                                                ];
                                                // Ensure object exists
                                                newServices[index - 1] = {
                                                  ...(newServices[index - 1] ||
                                                    {}),
                                                  yearsExperience: val,
                                                };
                                                setProviderForm({
                                                  ...providerForm,
                                                  servicesOffered: newServices,
                                                });
                                              }
                                            }}
                                            borderRadius="xl"
                                            bg="white"
                                          />
                                        </FormControl>
                                      ) : (
                                        <>
                                          <Text
                                            fontSize="xs"
                                            fontWeight="bold"
                                            color="gray.400"
                                            textTransform="uppercase"
                                            mb={1}
                                          >
                                            Years of Experience
                                          </Text>
                                          <Text fontSize="sm" fontWeight="bold">
                                            {service.yearsExperience
                                              ? `${service.yearsExperience} Years`
                                              : "-"}
                                          </Text>
                                        </>
                                      )}
                                    </Box>

                                    {/* Description */}
                                    <Box gridColumn={{ md: "span 2" }}>
                                      {isEditing ? (
                                        <FormControl>
                                          <FormLabel
                                            fontSize="xs"
                                            fontWeight="bold"
                                            color="gray.500"
                                          >
                                            Description
                                          </FormLabel>
                                          <Textarea
                                            value={service.description}
                                            onChange={(e) => {
                                              const val = e.target.value;
                                              if (isRoot) {
                                                setProviderForm({
                                                  ...providerForm,
                                                  description: val,
                                                });
                                              } else {
                                                const newServices = [
                                                  ...(providerForm.servicesOffered ||
                                                    []),
                                                ];
                                                newServices[index - 1] = {
                                                  ...(newServices[index - 1] ||
                                                    {}),
                                                  description: val,
                                                };
                                                setProviderForm({
                                                  ...providerForm,
                                                  servicesOffered: newServices,
                                                });
                                              }
                                            }}
                                            borderRadius="xl"
                                            bg="white"
                                          />
                                        </FormControl>
                                      ) : (
                                        <>
                                          <Text
                                            fontSize="xs"
                                            fontWeight="bold"
                                            color="gray.400"
                                            textTransform="uppercase"
                                            mb={1}
                                          >
                                            Description
                                          </Text>
                                          <Text fontSize="sm" color="gray.700">
                                            {service.description ||
                                              "No description provided."}
                                          </Text>
                                        </>
                                      )}
                                    </Box>

                                    {/* Extra Skills */}
                                    {service.extraSkills &&
                                      service.extraSkills.length > 0 && (
                                        <Box gridColumn="1 / -1">
                                          <Text
                                            fontSize="xs"
                                            fontWeight="bold"
                                            color="gray.400"
                                            textTransform="uppercase"
                                            mb={2}
                                          >
                                            Additional Skills
                                          </Text>
                                          <HStack wrap="wrap" spacing={2}>
                                            {service.extraSkills.map(
                                              (skill, si) => (
                                                <Tag
                                                  key={si}
                                                  size="sm"
                                                  variant="outline"
                                                  colorScheme="green"
                                                  borderRadius="full"
                                                >
                                                  {skill}
                                                </Tag>
                                              ),
                                            )}
                                          </HStack>
                                        </Box>
                                      )}
                                  </Grid>
                                </Box>
                              );
                            });
                          })()}
                        </Stack>
                      </Box>

                      <Divider borderColor="gray.100" />

                      {/* Qualifications (New Section) */}
                      {providerRequest.userType === "individual" &&
                        !isEditing && (
                          <>
                            <Box>
                              <SectionHeader
                                title="Qualifications"
                                icon={FiBriefcase}
                              />
                              <VStack align="stretch" w="full" spacing={4}>
                                {providerRequest.qualifications?.length > 0 ? (
                                  providerRequest.qualifications.map((q, i) => (
                                    <Box
                                      display="grid"
                                      gridTemplateColumns={{
                                        base: "1fr",
                                        md: "repeat(2, 1fr)",
                                      }}
                                      key={i}
                                      borderRadius="lg"
                                      gap="10px"
                                      p={4}
                                      bg="gray.50"
                                    >
                                      <Box>
                                        <Text
                                          fontSize="xs"
                                          fontWeight="bold"
                                          color="gray.400"
                                          textTransform="uppercase"
                                        >
                                          Degree/Certification
                                        </Text>
                                        <Text
                                          color="green.600"
                                          fontWeight="bold"
                                        >
                                          {q.degree}
                                        </Text>
                                      </Box>
                                      <Box>
                                        <Text
                                          fontSize="xs"
                                          fontWeight="bold"
                                          color="gray.400"
                                          textTransform="uppercase"
                                        >
                                          Institution
                                        </Text>
                                        <Text color="gray.700">
                                          {q.institution}
                                        </Text>
                                      </Box>
                                      <Box>
                                        <Text
                                          fontSize="xs"
                                          fontWeight="bold"
                                          color="gray.400"
                                          textTransform="uppercase"
                                        >
                                          Year of Completion
                                        </Text>
                                        <Text color="gray.700">{q.year}</Text>
                                      </Box>
                                    </Box>
                                  ))
                                ) : (
                                  <Text color="gray.500" fontSize="sm">
                                    No qualifications listed.
                                  </Text>
                                )}
                              </VStack>
                            </Box>
                            <Divider borderColor="gray.100" />
                          </>
                        )}

                      {/* Availability (New Section) */}
                      {!isEditing && (
                        <>
                          <Box>
                            <SectionHeader
                              title="Availability"
                              icon={TimeIcon}
                            />
                            <Grid
                              templateColumns={{
                                base: "1fr",
                                md: "repeat(2, 1fr)",
                              }}
                              gap={6}
                            >
                              <DisplayField
                                label="Days"
                                value={providerRequest.availability?.days?.join(
                                  ", ",
                                )}
                              />
                              <DisplayField
                                label="Hours"
                                value={
                                  providerRequest.availability?.hours?.start &&
                                  providerRequest.availability?.hours?.end
                                    ? `${providerRequest.availability?.hours?.start} - ${providerRequest.availability?.hours?.end}`
                                    : "Not provided"
                                }
                              />
                              <Box>
                                <Text
                                  fontSize="xs"
                                  color="gray.400"
                                  fontWeight="bold"
                                  textTransform="uppercase"
                                  mb={1}
                                >
                                  Emergency Services
                                </Text>
                                <Tag
                                  colorScheme={
                                    providerRequest.availability?.emergency
                                      ? "green"
                                      : "gray"
                                  }
                                  size="md"
                                  borderRadius="full"
                                >
                                  {providerRequest.availability?.emergency
                                    ? "Available for Emergency"
                                    : "Not Available for Emergency"}
                                </Tag>
                              </Box>
                            </Grid>
                          </Box>
                          <Divider borderColor="gray.100" />
                        </>
                      )}

                      {/* Pricing */}
                      <Box>
                        <SectionHeader title="Pricing" icon={AtSignIcon} />
                        <Grid
                          templateColumns={{
                            base: "1fr",
                            md: "repeat(3, 1fr)",
                          }}
                          gap={6}
                        >
                          {isEditing ? (
                            <>
                              <FormControl>
                                <FormLabel
                                  fontSize="xs"
                                  fontWeight="bold"
                                  color="gray.500"
                                >
                                  Pricing Model
                                </FormLabel>
                                <Select
                                  value={providerForm.pricingType}
                                  onChange={(e) =>
                                    setProviderForm({
                                      ...providerForm,
                                      pricingType: e.target.value,
                                    })
                                  }
                                  borderRadius="xl"
                                >
                                  <option value="Hourly">Hourly</option>
                                  <option value="Fixed">Fixed</option>
                                  <option value="Quote">Quote</option>
                                </Select>
                              </FormControl>
                              <FormControl>
                                <FormLabel
                                  fontSize="xs"
                                  fontWeight="bold"
                                  color="gray.500"
                                >
                                  Base Rate
                                </FormLabel>
                                <Input
                                  value={providerForm.baseRate}
                                  onChange={(e) =>
                                    setProviderForm({
                                      ...providerForm,
                                      baseRate: e.target.value,
                                    })
                                  }
                                  borderRadius="xl"
                                />
                              </FormControl>
                              <FormControl>
                                <FormLabel
                                  fontSize="xs"
                                  fontWeight="bold"
                                  color="gray.500"
                                >
                                  On-Site Charges
                                </FormLabel>
                                <Input
                                  value={providerForm.onSiteCharges}
                                  onChange={(e) =>
                                    setProviderForm({
                                      ...providerForm,
                                      onSiteCharges: e.target.value,
                                    })
                                  }
                                  borderRadius="xl"
                                />
                              </FormControl>
                            </>
                          ) : (
                            <>
                              <DisplayField
                                label="Pricing Model"
                                value={providerRequest.pricingType}
                              />
                              <DisplayField
                                label="Base Rate"
                                value={providerRequest.baseRate}
                              />
                              <DisplayField
                                label="On-Site Charges"
                                value={providerRequest.onSiteCharges}
                              />
                              {/* Payment Methods */}
                              <Box
                                gridColumn={{ base: "span 1", md: "span 3" }}
                              >
                                <Text
                                  fontSize="xs"
                                  color="gray.400"
                                  fontWeight="bold"
                                  textTransform="uppercase"
                                  mb={2}
                                >
                                  Payment Methods
                                </Text>
                                <HStack wrap="wrap" spacing={2}>
                                  {providerRequest.paymentMethods &&
                                  providerRequest.paymentMethods.length > 0 ? (
                                    providerRequest.paymentMethods.map(
                                      (p, i) => (
                                        <Tag
                                          key={i}
                                          size="sm"
                                          colorScheme="green"
                                          variant="outline"
                                          borderRadius="full"
                                        >
                                          {p}
                                        </Tag>
                                      ),
                                    )
                                  ) : (
                                    <Text
                                      fontSize="md"
                                      color="gray.700"
                                      fontWeight="medium"
                                    >
                                      Not provided
                                    </Text>
                                  )}
                                </HStack>
                              </Box>
                            </>
                          )}
                        </Grid>
                      </Box>

                      <Divider borderColor="gray.100" />

                      {/* Location */}
                      <Box>
                        <SectionHeader
                          title="Location & Contact"
                          icon={FiMapPin}
                        />
                        <Grid
                          templateColumns={{
                            base: "1fr",
                            md: "repeat(2, 1fr)",
                          }}
                          gap={6}
                        >
                          {isEditing ? (
                            <>
                              <GridItem colSpan={{ base: 1, md: 2 }}>
                                <FormControl>
                                  <GoogleMap
                                    formData={providerForm}
                                    setFormData={setProviderForm}
                                    viewOnly={false}
                                  />
                                </FormControl>
                              </GridItem>
                              <FormControl>
                                <FormLabel
                                  fontSize="xs"
                                  fontWeight="bold"
                                  color="gray.500"
                                >
                                  City
                                </FormLabel>
                                <Input
                                  value={providerForm.city}
                                  onChange={(e) =>
                                    setProviderForm({
                                      ...providerForm,
                                      city: e.target.value,
                                    })
                                  }
                                  borderRadius="xl"
                                />
                              </FormControl>
                              <FormControl>
                                <FormLabel
                                  fontSize="xs"
                                  fontWeight="bold"
                                  color="gray.500"
                                >
                                  State
                                </FormLabel>
                                <Input
                                  value={providerForm.state}
                                  onChange={(e) =>
                                    setProviderForm({
                                      ...providerForm,
                                      state: e.target.value,
                                    })
                                  }
                                  borderRadius="xl"
                                />
                              </FormControl>
                              <FormControl>
                                <FormLabel
                                  fontSize="xs"
                                  fontWeight="bold"
                                  color="gray.500"
                                >
                                  Country
                                </FormLabel>
                                <Input
                                  value={providerForm.country}
                                  onChange={(e) =>
                                    setProviderForm({
                                      ...providerForm,
                                      country: e.target.value,
                                    })
                                  }
                                  borderRadius="xl"
                                />
                              </FormControl>
                              <FormControl>
                                <FormLabel
                                  fontSize="xs"
                                  fontWeight="bold"
                                  color="gray.500"
                                >
                                  Zip Code
                                </FormLabel>
                                <Input
                                  value={providerForm.zipCode}
                                  onChange={(e) =>
                                    setProviderForm({
                                      ...providerForm,
                                      zipCode: e.target.value,
                                    })
                                  }
                                  borderRadius="xl"
                                />
                              </FormControl>
                            </>
                          ) : (
                            <>
                              <GridItem colSpan={{ base: 1, md: 2 }}>
                                <DisplayField
                                  label="Address"
                                  value={providerRequest.address}
                                />
                              </GridItem>
                              <DisplayField
                                label="City"
                                value={providerRequest.city}
                              />
                              <DisplayField
                                label="State"
                                value={providerRequest.state}
                              />
                              <DisplayField
                                label="Country"
                                value={providerRequest.country}
                              />
                              <DisplayField
                                label="Zip Code"
                                value={providerRequest.zipCode}
                              />
                            </>
                          )}
                        </Grid>
                      </Box>

                      {/* Documents / Verification Status */}
                      <Box>
                        <SectionHeader
                          title="Verification Documents"
                          icon={CheckIcon}
                        />
                        <HStack spacing={4} wrap="wrap">
                          {providerRequest.idProofUrl && (
                            <Tag
                              size="lg"
                              colorScheme="green"
                              borderRadius="full"
                            >
                              <TagLabel>ID Proof Uploaded</TagLabel>
                            </Tag>
                          )}
                          {providerRequest.companyLogo && (
                            <Tag
                              size="lg"
                              colorScheme="blue"
                              borderRadius="full"
                            >
                              <TagLabel>Company Logo Uploaded</TagLabel>
                            </Tag>
                          )}
                          {providerRequest.profilePhoto && (
                            <Tag
                              size="lg"
                              colorScheme="purple"
                              borderRadius="full"
                            >
                              <TagLabel>Profile Photo Uploaded</TagLabel>
                            </Tag>
                          )}
                          {providerRequest.backgroundCheck && (
                            <Tag
                              size="lg"
                              colorScheme="teal"
                              borderRadius="full"
                            >
                              <TagLabel>Background Check Consented</TagLabel>
                            </Tag>
                          )}
                        </HStack>
                      </Box>

                      <Divider borderColor="gray.100" />

                      {/* Rejection Notification (if any) */}
                      {providerRequest.status === "REJECTED" && (
                        <Box
                          bg="red.50"
                          p={4}
                          borderRadius="xl"
                          border="1px solid"
                          borderColor="red.200"
                        >
                          <HStack mb={2}>
                            <Icon as={CloseIcon} color="red.500" />
                            <Text fontWeight="bold" color="red.700">
                              Rejection Reason
                            </Text>
                          </HStack>
                          <Text color="red.600">
                            {providerRequest.rejectionReason ||
                              "No reason provided."}
                          </Text>
                        </Box>
                      )}
                    </Stack>
                  </Box>
                  <Divider borderColor="gray.100" />

                  {/* Licenses Section */}
                  <Box>
                    <Flex justify="space-between" align="center" mb={6}>
                      <SectionHeader
                        title="Professional Licenses"
                        icon={CheckIcon}
                      />
                    </Flex>

                    {providerRequest.licenses &&
                    Array.isArray(providerRequest.licenses) &&
                    providerRequest.licenses.length > 0 ? (
                      <Grid
                        templateColumns={{ base: "1fr", md: "repeat(1, 1fr)" }}
                        gap={4}
                      >
                        {providerRequest.licenses.map((license, index) => (
                          <Box
                            key={index}
                            p={4}
                            borderWidth="1px"
                            borderRadius="xl"
                            bg="gray.50"
                          >
                            <Flex justify="space-between" align="start">
                              <Stack spacing={1}>
                                <HStack>
                                  <Text fontWeight="bold" fontSize="lg">
                                    {license.name} (v{license.version || 1})
                                  </Text>
                                  {license.status === "EXPIRED" && (
                                    <Badge colorScheme="red">EXPIRED</Badge>
                                  )}
                                  {license.status === "PENDING" && (
                                    <Badge colorScheme="orange">PENDING</Badge>
                                  )}
                                </HStack>
                                <Text fontSize="sm" color="gray.600">
                                  Authority: {license.authority}
                                </Text>
                                <Text fontSize="sm" color="gray.600">
                                  License #: {license.number}
                                </Text>
                                <Text
                                  fontSize="sm"
                                  color={
                                    new Date(license.expiry) < new Date()
                                      ? "red.500"
                                      : "green.500"
                                  }
                                >
                                  Expires: {license.expiry}{" "}
                                  {new Date(license.expiry) < new Date() &&
                                    "(Expired)"}
                                </Text>
                              </Stack>
                              <HStack>
                                {license.document?.secureUrl && (
                                  <Button
                                    size="sm"
                                    as="a"
                                    href={license.document.secureUrl}
                                    target="_blank"
                                    variant="ghost"
                                    colorScheme="blue"
                                    leftIcon={<Icon as={FiBriefcase} />}
                                  >
                                    View
                                  </Button>
                                )}
                                <LicenseUpdateModal
                                  license={license}
                                  index={index}
                                  onUpdate={() => fetchProfile()}
                                  allLicenses={providerRequest.licenses}
                                />
                              </HStack>
                            </Flex>

                            {license.history && license.history.length > 0 && (
                              <Accordion
                                allowToggle
                                mt={4}
                                borderTop="1px solid"
                                borderColor="gray.200"
                                pt={2}
                              >
                                <AccordionItem border="none">
                                  <h2>
                                    <AccordionButton
                                      px={0}
                                      _hover={{ bg: "transparent" }}
                                    >
                                      <Box
                                        flex="1"
                                        textAlign="left"
                                        fontSize="sm"
                                        fontWeight="bold"
                                        color="gray.600"
                                      >
                                        View Previous Versions (
                                        {license.history.length})
                                      </Box>
                                      <AccordionIcon color="gray.500" />
                                    </AccordionButton>
                                  </h2>
                                  <AccordionPanel pb={2} px={0}>
                                    <Stack spacing={3}>
                                      {license.history.map((h, hIdx) => (
                                        <Box
                                          key={hIdx}
                                          p={3}
                                          bg="white"
                                          borderRadius="md"
                                          border="1px solid"
                                          borderColor="gray.200"
                                          fontSize="sm"
                                        >
                                          <Flex justify="space-between" mb={1}>
                                            <Badge
                                              colorScheme={
                                                h.status === "EXPIRED"
                                                  ? "red"
                                                  : "gray"
                                              }
                                            >
                                              v{h.version}
                                            </Badge>
                                            <Text
                                              color="gray.500"
                                              fontSize="xs"
                                            >
                                              {h.updatedAt
                                                ? new Date(
                                                    h.updatedAt,
                                                  ).toLocaleDateString()
                                                : "Unknown Date"}
                                            </Text>
                                          </Flex>
                                          <Text>
                                            <strong>Expiry:</strong> {h.expiry}
                                          </Text>
                                          <Text mb={1}>
                                            <strong>Status:</strong>{" "}
                                            {h.status || "N/A"}
                                          </Text>
                                          {h.document?.secureUrl && (
                                            <Link
                                              href={h.document.secureUrl}
                                              isExternal
                                              color="blue.500"
                                              fontSize="xs"
                                            >
                                              View Document
                                            </Link>
                                          )}
                                        </Box>
                                      ))}
                                    </Stack>
                                  </AccordionPanel>
                                </AccordionItem>
                              </Accordion>
                            )}
                          </Box>
                        ))}
                      </Grid>
                    ) : (
                      <Text color="gray.500" fontSize="sm">
                        No licenses provided.
                      </Text>
                    )}
                    {/* Project Gallery */}
                    <Box
                      mt={10}
                      pt={6}
                      borderTop="1px solid"
                      borderColor="gray.100"
                    >
                      <SectionHeader title="Project Gallery" icon={FiImage} />
                      <Grid
                        templateColumns="repeat(auto-fill, minmax(150px, 1fr))"
                        gap={4}
                        mt={6}
                      >
                        {(providerForm.gallery || []).map((img, i) => (
                          <Box
                            key={i}
                            position="relative"
                            borderRadius="xl"
                            overflow="hidden"
                            h="150px"
                            boxShadow="sm"
                            group
                          >
                            <Image
                              src={img}
                              alt={`Gallery ${i}`}
                              w="full"
                              h="full"
                              objectFit="cover"
                            />
                            <IconButton
                              icon={<FiTrash2 />}
                              size="sm"
                              colorScheme="red"
                              position="absolute"
                              top={2}
                              right={2}
                              onClick={() => handleRemoveGalleryImage(i)}
                              aria-label="Remove image"
                              opacity={0.8}
                              _hover={{ opacity: 1 }}
                            />
                          </Box>
                        ))}

                        <Box
                          as="label"
                          htmlFor="galleryInput"
                          cursor="pointer"
                          h="150px"
                          borderRadius="xl"
                          border="2px dashed"
                          borderColor="gray.300"
                          display="flex"
                          flexDirection="column"
                          alignItems="center"
                          justifyContent="center"
                          _hover={{
                            borderColor: "green.400",
                            bg: "green.50",
                          }}
                          transition="all 0.2s"
                        >
                          {uploading ? (
                            <Spinner color="green.500" />
                          ) : (
                            <>
                              <Icon
                                as={FiPlus}
                                boxSize={8}
                                color="gray.400"
                                mb={2}
                              />
                              <Text
                                fontSize="sm"
                                color="gray.500"
                                fontWeight="bold"
                              >
                                Add Photo
                              </Text>
                            </>
                          )}
                          <Input
                            id="galleryInput"
                            type="file"
                            accept="image/*"
                            display="none"
                            onChange={(e) => handleImageUpload(e, "gallery")}
                          />
                        </Box>
                      </Grid>
                    </Box>
                  </Box>
                </TabPanel>
              )}
            </TabPanels>
          </Tabs>
        </MotionBox>
      </Container>
    </Box>
  );
}

const LicenseUpdateModal = ({ license, index, onUpdate, allLicenses }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [expiry, setExpiry] = useState(license.expiry || "");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const toast = useToast();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpdate = async () => {
    setUploading(true);
    try {
      let documentData = license.document;

      // 1. Upload new file if selected
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await fetch(
          "/api/provider/onboarding/license-upload",
          {
            method: "POST",
            body: formData,
          },
        );

        if (!uploadRes.ok) throw new Error("File upload failed");
        const uploadData = await uploadRes.json();
        documentData = uploadData; // Update document structure
      }

      // 2. Prepare updated licenses array
      const historyEntry = {
        version: license.version || 1,
        expiry: license.expiry,
        document: license.document,
        status: license.status,
        updatedAt: new Date().toISOString(),
      };

      const currentHistory = Array.isArray(license.history)
        ? license.history
        : [];

      const updatedLicense = {
        ...license,
        expiry: expiry,
        document: documentData,
        version: (license.version || 1) + 1,
        status: "PENDING",
        history: [historyEntry, ...currentHistory],
      };

      const newLicensesList = [...allLicenses];
      newLicensesList[index] = updatedLicense;

      // 3. Update Provider Request
      const updateRes = await fetch("/api/provider/request", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenses: newLicensesList }),
      });

      if (!updateRes.ok) throw new Error("Failed to update license");

      toast({ title: "License Updated", status: "success", duration: 3000 });
      onClose();
      onUpdate(); // Refresh profile
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Button size="sm" onClick={onOpen} colorScheme="green" variant="outline">
        Update
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update License</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <FormControl>
                <FormLabel>Expiry Date</FormLabel>
                <Input
                  type="date"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Upload New Document (Optional)</FormLabel>
                <Input type="file" onChange={handleFileChange} p={1} />
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="green"
              isLoading={uploading}
              onClick={handleUpdate}
            >
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
