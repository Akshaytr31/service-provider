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
} from "@chakra-ui/react";
import {
  EditIcon,
  CheckIcon,
  CloseIcon,
  InfoIcon,
  PhoneIcon,
  EmailIcon,
  AtSignIcon,
} from "@chakra-ui/icons";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MotionBox = motion(Box);

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const user = session?.user;
  const toast = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

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
      if (data.profile) {
        setProfile(data.profile);
        setForm({
          firstName: data.profile.firstName || "",
          lastName: data.profile.lastName || "",
          email: user?.email || "",
          mobile: user?.mobile || "",
          gender: data.profile.gender || "",
          dob: data.profile.dateOfBirth || "",
          city: data.profile.city || "",
          state: data.profile.state || "",
          country: data.profile.country || "",
          address: data.profile.address || "",
          zipCode: data.profile.zipCode || "",
          userType: data.profile.userType || "individual",
          businessName: data.profile.businessName || "",
          businessType: data.profile.businessType || "",
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

      <Container maxW="container.md" position="relative" zIndex={1}>
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

              {!isEditing ? (
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
              ) : (
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

          {/* Details Card */}
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
                    <SectionHeader title="Basic Information" icon={InfoIcon} />
                    <Grid
                      templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                      gap={6}
                    >
                      <DisplayField label="First Name" value={form.firstName} />
                      <DisplayField label="Last Name" value={form.lastName} />
                      <DisplayField label="Gender" value={form.gender} />
                      <DisplayField label="Date of Birth" value={form.dob} />
                      <DisplayField label="Mobile" value={form.mobile} />
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
                        templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
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
                    <SectionHeader title="Location Details" icon={PhoneIcon} />
                    <Grid
                      templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                      gap={6}
                    >
                      <GridItem colSpan={{ base: 1, md: 2 }}>
                        <DisplayField label="Address" value={form.address} />
                      </GridItem>
                      <DisplayField label="City" value={form.city} />
                      <DisplayField label="State" value={form.state} />
                      <DisplayField label="Country" value={form.country} />
                      <DisplayField label="Zip Code" value={form.zipCode} />
                    </Grid>
                  </Box>
                </Stack>
              ) : (
                <Stack spacing={6}>
                  <SectionHeader title="Edit Profile Details" icon={EditIcon} />

                  <Grid
                    templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                    gap={6}
                  >
                    <FormControl>
                      <FormLabel fontSize="sm" color="gray.600">
                        First Name
                      </FormLabel>
                      <Input
                        value={form.firstName}
                        onChange={(e) =>
                          setForm({ ...form, firstName: e.target.value })
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
                            setForm({ ...form, address: e.target.value })
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
        </MotionBox>
      </Container>
    </Box>
  );
}
