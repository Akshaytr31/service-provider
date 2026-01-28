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
} from "@chakra-ui/react";
import {
  EditIcon,
  CheckIcon,
  CloseIcon,
  InfoIcon,
  PhoneIcon,
  EmailIcon,
  AtSignIcon,
  TimeIcon,
} from "@chakra-ui/icons";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiBriefcase, FiMapPin, FiUser } from "react-icons/fi";

const MotionBox = motion(Box);

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const user = session?.user;
  const toast = useToast();

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
    } catch (err) {
      console.error("Failed to fetch profile", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

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
          {/* Header Card */}
          <Box
            bg="white"
            p={8}
            borderRadius="3xl"
            boxShadow="0 10px 30px rgba(0,0,0,0.05)"
            border="1px solid"
            borderColor="gray.100"
            mb={8}
          >
            <Flex justify="space-between" align="start" wrap="wrap" gap={4}>
              <Flex gap={6} align="center">
                <Avatar
                  size="2xl"
                  bg="green.500"
                  color="white"
                  name={user.name || user.email}
                  src={user.image}
                  border="4px solid"
                  borderColor="green.50"
                  boxShadow="lg"
                />
                <Stack spacing={2}>
                  <Heading size="xl" color="gray.800" letterSpacing="tight">
                    {form.firstName || form.lastName
                      ? `${form.firstName} ${form.lastName}`
                      : user.name || "User"}
                  </Heading>
                  <HStack>
                    <Tag
                      colorScheme="green"
                      variant="subtle"
                      borderRadius="full"
                      px={3}
                    >
                      {user.role?.toUpperCase()}
                    </Tag>
                    {profile?.userType && (
                      <Tag
                        colorScheme="blue"
                        variant="subtle"
                        borderRadius="full"
                        px={3}
                      >
                        {profile.userType.toUpperCase()}
                      </Tag>
                    )}
                  </HStack>
                </Stack>
              </Flex>

              {!isEditing && (
                <Button
                  leftIcon={<EditIcon />}
                  colorScheme="green"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  borderRadius="xl"
                  _hover={{ bg: "green.50" }}
                >
                  Edit Profile
                </Button>
              )}

              {isEditing && (
                <HStack spacing={3}>
                  <Button
                    leftIcon={<CloseIcon />}
                    variant="ghost"
                    onClick={handleCancel}
                    borderRadius="xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    leftIcon={<CheckIcon />}
                    colorScheme="green"
                    onClick={handleSave}
                    borderRadius="xl"
                    boxShadow="0 10px 20px rgba(72, 187, 120, 0.2)"
                  >
                    Save Changes
                  </Button>
                </HStack>
              )}
            </Flex>
          </Box>

          <Tabs variant="soft-rounded" colorScheme="green" isLazy>
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

            <TabPanels>
              {!isProviderAtFirst && (
                <TabPanel p={0}>
                  {/* Details Card (Seeker) */}
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
                <TabPanel p={0} pt={4}>
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
                    </Flex>

                    <Stack spacing={8}>
                      {/* Identity Section - Conditional based on Type */}
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
                          ) : (
                            <>
                              <DisplayField
                                label="Full Name"
                                value={`${providerRequest.firstName || ""} ${providerRequest.lastName || ""}`}
                              />
                              <DisplayField
                                label="Date of Birth"
                                value={providerRequest.dateOfBirth}
                              />
                              <DisplayField
                                label="Gender"
                                value={providerRequest.gender}
                              />
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
                        </Grid>
                      </Box>

                      <Divider borderColor="gray.100" />

                      {/* Service Details */}
                      <Box>
                        <SectionHeader
                          title="Service Details"
                          icon={FiBriefcase}
                        />
                        <Grid
                          templateColumns={{
                            base: "1fr",
                            md: "repeat(2, 1fr)",
                          }}
                          gap={6}
                        >
                          <DisplayField
                            label="Category ID"
                            value={providerRequest.categoryId}
                          />
                          <DisplayField
                            label="Sub Category ID"
                            value={providerRequest.subCategoryId}
                          />
                          <DisplayField
                            label="Service Radius"
                            value={
                              providerRequest.serviceRadius
                                ? `${providerRequest.serviceRadius} km`
                                : "N/A"
                            }
                          />
                          <DisplayField
                            label="Years of Experience"
                            value={providerRequest.yearsExperience}
                          />
                          <GridItem colSpan={{ base: 1, md: 2 }}>
                            <DisplayField
                              label="Description"
                              value={
                                providerRequest.description ||
                                "No description provided."
                              }
                            />
                          </GridItem>
                        </Grid>
                      </Box>

                      <Divider borderColor="gray.100" />

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
                                <Text fontWeight="bold" fontSize="lg">
                                  {license.name}
                                </Text>
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
                          </Box>
                        ))}
                      </Grid>
                    ) : (
                      <Text color="gray.500" fontSize="sm">
                        No licenses provided.
                      </Text>
                    )}
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
      const updatedLicense = {
        ...license,
        expiry: expiry,
        document: documentData,
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
