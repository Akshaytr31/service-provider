"use client";

import {
  Box,
  Heading,
  Text,
  Stack,
  Avatar,
  Flex,
  Container,
  Grid,
  GridItem,
  Tag,
  TagLabel,
  HStack,
  Icon,
  Badge,
  Button,
  SimpleGrid,
  useColorModeValue,
  VStack,
  Divider,
  Image,
  Spinner,
  IconButton,
  Link,
  Tooltip,
} from "@chakra-ui/react";
import {
  InfoIcon,
  PhoneIcon,
  EmailIcon,
  CheckIcon,
  TimeIcon,
  StarIcon,
  EmailIcon as MailIcon,
} from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiBriefcase,
  FiMapPin,
  FiUser,
  FiAward,
  FiDollarSign,
  FiPhone,
  FiMail,
  FiImage,
  FiClock,
  FiCheckCircle,
  FiExternalLink,
  FiMap,
  FiHome,
  FiHash,
} from "react-icons/fi";
import { useParams, useRouter } from "next/navigation";

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionStack = motion(Stack);

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [providerRequest, setProviderRequest] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/public/profile/${id}`);
        if (!res.ok) {
          throw new Error("Profile not found");
        }
        const data = await res.json();
        console.log("data", data);

        setProfile(data.profile || {});
        setUser(data.user || {});
        setProviderRequest(data.providerRequest || null);

        // Redirect to slug if accessing by ID and slug exists
        if (data.user?.slug && id !== data.user.slug && !isNaN(parseInt(id))) {
          router.replace(`/profile/${data.user.slug}`);
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProfile();
    }
  }, [id]);

  if (loading)
    return (
      <Flex h="100vh" align="center" justify="center" bg="gray.50">
        <VStack spacing={4}>
          <Spinner size="xl" color="green.500" thickness="4px" />
          <Text fontSize="lg" color="gray.600" fontWeight="medium">
            Loading Profile...
          </Text>
        </VStack>
      </Flex>
    );

  if (error || !user)
    return (
      <Flex h="100vh" align="center" justify="center" bg="gray.50" px={4}>
        <MotionBox
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          textAlign="center"
          p={10}
          bg="white"
          borderRadius="xl"
          boxShadow="xl"
        >
          <VStack spacing={6}>
            <Box bg="red.50" p={5} borderRadius="full">
              <Icon as={FiUser} boxSize={10} color="red.400" />
            </Box>
            <VStack spacing={2}>
              <Heading size="lg" color="gray.800">
                Profile Not Found
              </Heading>
              <Text color="gray.500" maxW="300px">
                The user you are looking for does not exist, has been removed,
                or is currently private.
              </Text>
            </VStack>
          </VStack>
        </MotionBox>
      </Flex>
    );

  const displayName =
    profile?.firstName || profile?.lastName
      ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim()
      : user.name || "User";

  const isProvider = !!providerRequest;
  const avatarSrc = providerRequest?.profilePhoto || user.image;

  return (
    <Box minH="100vh" bg="#f8fafc" pb={20}>
      {/* 1. HERO SECTION WITH BANNER */}
      <Box position="relative" h={{ base: "350px", md: "450px" }}>
        {/* Banner with fallback gradient */}
        <Box
          h="full"
          w="full"
          bgGradient="linear(to-br, green.600, hwb(167 0% 41%))"
          position="relative"
          overflow="hidden"
        >
          {providerRequest?.bannerPhoto ? (
            <Image
              src={providerRequest.bannerPhoto}
              alt="Profile Banner"
              w="full"
              h="full"
              objectFit="cover"
            />
          ) : (
            <Box
              position="absolute"
              top="-20%"
              right="-10%"
              boxSize="400px"
              bg="whiteAlpha.200"
              borderRadius="full"
              filter="blur(60px)"
            />
          )}
        </Box>

        {/* Identity Information Overlapping */}
        <Container
          maxW="container.xl"
          h="full"
          position="absolute"
          top={"-10px"}
        >
          <Flex
            position="absolute"
            alignItems={"flex-start"}
            bottom={"-80px"}
            left={{ base: "50%", md: "40px" }}
            transform={{ base: "translateX(-50%)", md: "none" }}
            direction={{ base: "column", md: "row" }}
            align={{ base: "center", md: "flex-end" }}
            gap={{ base: 4, md: 8 }}
            zIndex={2}
            w={{ base: "full", md: "auto" }}
          >
            <MotionBox
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Avatar
                size="2xl"
                name={displayName}
                src={avatarSrc}
                w={{ base: "150px", md: "180px" }}
                h={{ base: "150px", md: "180px" }}
                border="6px solid white"
                boxShadow="2xl"
                bg="white"
              />
            </MotionBox>

            <VStack
              align={{ base: "center", md: "flex-start" }}
              spacing={1}
              mb={{ base: 0, md: 4 }}
              textAlign={{ base: "center", md: "left" }}
              marginTop={"18px"}
            >
              <MotionBox
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <HStack spacing={3}>
                  <Heading
                    size="2xl"
                    color="white"
                    fontWeight="900"
                    textShadow="0 2px 10px rgba(0,0,0,0.2)"
                  >
                    {displayName}
                  </Heading>
                  {isProvider && (
                    <Tooltip label="Verified Professional">
                      <Icon
                        as={FiCheckCircle}
                        color="green.400"
                        boxSize={8}
                        bg="white"
                        borderRadius="full"
                      />
                    </Tooltip>
                  )}
                </HStack>
              </MotionBox>

              <MotionBox
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <HStack spacing={3} mt={1}>
                  <Badge
                    colorScheme="whiteAlpha"
                    bg="whiteAlpha.300"
                    color="white"
                    px={3}
                    py={1}
                    borderRadius="full"
                    backdropFilter="blur(5px)"
                    fontSize="sm"
                    letterSpacing="wider"
                  >
                    {isProvider ? "PROVIDER" : "MEMBER"}
                  </Badge>
                  {providerRequest?.city && (
                    <HStack
                      color="whiteAlpha.900"
                      fontSize="md"
                      fontWeight="medium"
                    >
                      <Icon as={FiMapPin} />
                      <Text>
                        {providerRequest.city}, {providerRequest.country}
                      </Text>
                    </HStack>
                  )}
                </HStack>
              </MotionBox>
            </VStack>
          </Flex>
        </Container>
      </Box>

      {/* 2. MAIN CONTENT */}
      <Container maxW="container.xl" mt="100px">
        <Grid templateColumns={{ base: "1fr", lg: "1fr 350px" }} gap={10}>
          {/* LEFT COLUMN: Main Info */}
          <GridItem>
            <Stack spacing={10}>
              {/* About Section */}
              <SectionWrapper title="About Professional" icon={FiUser}>
                <Text fontSize="lg" color="gray.600" lineHeight="tall">
                  {isProvider && providerRequest.description
                    ? providerRequest.description
                    : "This professional hasn't shared their story yet."}
                </Text>
              </SectionWrapper>

              {/* Gallery Section */}
              {isProvider &&
                providerRequest.gallery &&
                providerRequest.gallery.length > 0 && (
                  <SectionWrapper title="Project Gallery" icon={FiImage}>
                    <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
                      {providerRequest.gallery.map((img, idx) => (
                        <MotionBox
                          key={idx}
                          role="group"
                          position="relative"
                          borderRadius="2xl"
                          overflow="hidden"
                          h="200px"
                          whileHover={{ y: -5 }}
                          initial={{ opacity: 0, scale: 0.9 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.1 }}
                          boxShadow="md"
                        >
                          <Image
                            src={img}
                            alt={`Gallery Project ${idx}`}
                            w="full"
                            h="full"
                            objectFit="cover"
                            transition="transform 0.5s ease"
                            _groupHover={{ transform: "scale(1.1)" }}
                          />
                          <Box
                            position="absolute"
                            inset={0}
                            bgGradient="linear(to-t, blackAlpha.600, transparent)"
                            opacity={0}
                            _groupHover={{ opacity: 1 }}
                            transition="opacity 0.3s"
                            display="flex"
                            alignItems="flex-end"
                            p={4}
                          >
                            <Text color="white" fontWeight="bold" fontSize="sm">
                              Project View
                            </Text>
                          </Box>
                        </MotionBox>
                      ))}
                    </SimpleGrid>
                  </SectionWrapper>
                )}

              {/* Services Offered */}
              {isProvider && (
                <SectionWrapper title="Our Expertise" icon={FiBriefcase}>
                  <Stack spacing={8}>
                    {/* All Services List */}
                    <Stack spacing={4}>
                      {/* Additional Services */}
                      {providerRequest.servicesOffered &&
                        Array.isArray(providerRequest.servicesOffered) &&
                        providerRequest.servicesOffered.map((service, idx) => (
                          <Box
                            key={idx}
                            bg="white"
                            p={6}
                            borderRadius="2xl"
                            border="1px solid"
                            borderColor="gray.100"
                            boxShadow="sm"
                            transition="all 0.3s"
                            _hover={{
                              transform: "translateY(-2px)",
                              boxShadow: "md",
                            }}
                          >
                            <HStack justify="space-between" mb={2}>
                              <VStack align="start" spacing={0}>
                                <Text
                                  fontSize="xs"
                                  color="blue.500"
                                  fontWeight="bold"
                                  textTransform="uppercase"
                                  letterSpacing="wider"
                                >
                                  Additional Service
                                </Text>
                                <Heading size="md" color="gray.800">
                                  {service.subCategoryName ||
                                    "Professional Service"}
                                </Heading>
                              </VStack>
                              <Badge
                                colorScheme="blue"
                                variant="subtle"
                                px={3}
                                py={1}
                                borderRadius="lg"
                              >
                                {service.categoryName || "Expert"}
                              </Badge>
                            </HStack>
                            {service.description && (
                              <Text color="gray.600" fontSize="sm">
                                {service.description}
                              </Text>
                            )}
                            <HStack mt={3} spacing={4}>
                              <HStack spacing={1} color="gray.400">
                                <Icon as={FiClock} boxSize={3} />
                                <Text fontSize="xs" fontWeight="bold">
                                  {service.yearsExperience}+ Years Exp.
                                </Text>
                              </HStack>
                            </HStack>
                          </Box>
                        ))}
                    </Stack>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <FeatureCardSmall
                        icon={FiClock}
                        label="Experience"
                        value={`${providerRequest.servicesOffered[0].yearsExperience || "5+"} Years`}
                      />
                      <FeatureCardSmall
                        icon={FiMapPin}
                        label="Service Radius"
                        value={`${providerRequest.serviceRadius || "30"} KM`}
                      />
                      <FeatureCardSmall
                        icon={FiDollarSign}
                        label="Base Pricing"
                        value={providerRequest.baseRate || "Competitive"}
                      />
                      <FeatureCardSmall
                        icon={FiAward}
                        label="Status"
                        value="Verified Expert"
                      />
                    </SimpleGrid>
                  </Stack>
                </SectionWrapper>
              )}

              {/* Location Section - Premium Redesign */}
              {isProvider && (
                <SectionWrapper title="Service Location" icon={FiMapPin}>
                  <Box
                    borderRadius="xl"
                    overflow="hidden"
                    boxShadow="2xl"
                    bg="white"
                    position="relative"
                    role="group"
                  >
                    <Grid templateColumns={{ base: "1fr", md: "2fr 3fr" }}>
                      {/* Details Column - Stylish Left Panel */}
                      <Box
                        p={8}
                        bgGradient="linear(to-br, green.600, green.700)"
                        color="white"
                        position="relative"
                        overflow="hidden"
                      >
                        {/* Decorative background circles */}
                        <Box
                          position="absolute"
                          top="-20%"
                          left="-20%"
                          boxSize="200px"
                          bg="whiteAlpha.100"
                          borderRadius="full"
                        />
                        <Box
                          position="absolute"
                          bottom="-10%"
                          right="-10%"
                          boxSize="150px"
                          bg="whiteAlpha.100"
                          borderRadius="full"
                        />

                        <VStack
                          align="start"
                          spacing={8}
                          position="relative"
                          zIndex={1}
                        >
                          <VStack align="start" spacing={2}>
                            <Badge
                              colorScheme="whiteAlpha"
                              bg="whiteAlpha.300"
                              color="white"
                              px={3}
                              py={1}
                              borderRadius="full"
                            >
                              Location
                            </Badge>
                            <Heading
                              size="lg"
                              fontWeight="900"
                              lineHeight="short"
                            >
                              {providerRequest.city}, {providerRequest.country}
                            </Heading>
                            <Text color="blue.100" fontSize="sm" opacity={0.9}>
                              Primary service area and surrounding districts.
                            </Text>
                          </VStack>

                          <SimpleGrid columns={1} spacing={5} w="full">
                            <HStack spacing={4}>
                              <Flex
                                boxSize="50px"
                                bg="whiteAlpha.200"
                                borderRadius="xl"
                                align="center"
                                justify="center"
                                backdropFilter="blur(5px)"
                                border="1px solid"
                                borderColor="whiteAlpha.300"
                              >
                                <Icon as={FiMapPin} boxSize={6} color="white" />
                              </Flex>
                              <Box>
                                <Text
                                  fontSize="xs"
                                  textTransform="uppercase"
                                  letterSpacing="widest"
                                  opacity={0.7}
                                >
                                  State/District
                                </Text>
                                <Text fontSize="lg" fontWeight="bold">
                                  {providerRequest.state}
                                </Text>
                              </Box>
                            </HStack>

                            <HStack spacing={4}>
                              <Flex
                                boxSize="50px"
                                bg="whiteAlpha.200"
                                borderRadius="xl"
                                align="center"
                                justify="center"
                                backdropFilter="blur(5px)"
                                border="1px solid"
                                borderColor="whiteAlpha.300"
                              >
                                <Icon as={FiHash} boxSize={6} color="white" />
                              </Flex>
                              <Box>
                                <Text
                                  fontSize="xs"
                                  textTransform="uppercase"
                                  letterSpacing="widest"
                                  opacity={0.7}
                                >
                                  Postal Code
                                </Text>
                                <Text fontSize="lg" fontWeight="bold">
                                  {providerRequest.zipCode}
                                </Text>
                              </Box>
                            </HStack>
                          </SimpleGrid>

                          <Button
                            size="sm"
                            bg="white"
                            color="blue.600"
                            rightIcon={<Icon as={FiExternalLink} />}
                            _hover={{ bg: "blue.50" }}
                            onClick={() =>
                              window.open(
                                `https://maps.google.com/?q=${encodeURIComponent(`${providerRequest.address || ""} ${providerRequest.city || ""} ${providerRequest.country || ""}`)}`,
                                "_blank",
                              )
                            }
                          >
                            Open in Google Maps
                          </Button>
                        </VStack>
                      </Box>

                      {/* Map Column - Full height interactive */}
                      <Box
                        position="relative"
                        h={{ base: "300px", md: "auto" }}
                      >
                        <iframe
                          width="100%"
                          height="100%"
                          style={{
                            border: 0,
                            filter: "grayscale(20%) Contrast(1.1)",
                          }}
                          loading="lazy"
                          allowFullScreen
                          src={`https://maps.google.com/maps?q=${encodeURIComponent(
                            `${providerRequest.address || ""} ${
                              providerRequest.city || ""
                            } ${providerRequest.state || ""} ${
                              providerRequest.country || ""
                            }`,
                          )}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                        ></iframe>
                      </Box>
                    </Grid>
                  </Box>
                </SectionWrapper>
              )}
            </Stack>
          </GridItem>

          {/* RIGHT COLUMN: Sidebar Stats & Info */}
          <GridItem>
            <Stack spacing={8} position="sticky" top="24px">
              {/* Profile Overview Card */}
              <Box
                bg="white"
                p={8}
                borderRadius="xl"
                boxShadow="xl"
                border="1px solid"
                borderColor="gray.50"
              >
                <VStack spacing={6}>
                  <VStack spacing={1} textAlign="center">
                    <Text
                      fontSize="xs"
                      fontWeight="bold"
                      color="gray.400"
                      textTransform="uppercase"
                      letterSpacing="widest"
                    >
                      Profile Stats
                    </Text>
                    <Heading size="md" color="gray.800">
                      {isProvider ? "Professional Insight" : "Member Overview"}
                    </Heading>
                  </VStack>

                  <Divider />

                  <SimpleGrid columns={2} spacing={10} w="full">
                    <SidebarStat
                      label="Rating"
                      value="5.0"
                      icon={StarIcon}
                      color="orange.400"
                    />
                    <SidebarStat
                      label="Hires"
                      value="24+"
                      icon={FiCheckCircle}
                      color="green.400"
                    />
                  </SimpleGrid>

                  <Divider />

                  <VStack spacing={4} w="full">
                    <DetailItem
                      label="Languages"
                      value={profile?.languages || "English"}
                      icon={FiUser}
                    />
                    <DetailItem
                      label="Member Since"
                      value="Jan 2024"
                      icon={FiClock}
                    />
                    <DetailItem
                      label="User Type"
                      value={
                        providerRequest?.userType?.toUpperCase() || "INDIVIDUAL"
                      }
                      icon={FiBriefcase}
                    />
                  </VStack>

                  <Button
                    w="full"
                    size="lg"
                    colorScheme="green"
                    h="60px"
                    borderRadius="2xl"
                    boxShadow="lg"
                    _hover={{ transform: "translateY(-2px)", boxShadow: "2xl" }}
                    onClick={() =>
                      (window.location.href = `mailto:${user.email}`)
                    }
                  >
                    Contact Professional
                  </Button>
                </VStack>
              </Box>

              {/* Service Pricing Summary */}
              {isProvider && (
                <Box
                  bgGradient="linear(to-br, gray.800, gray.900)"
                  p={8}
                  borderRadius="xl"
                  color="white"
                  boxShadow="2xl"
                >
                  <VStack align="start" spacing={6}>
                    <Heading size="md">Pricing Terms</Heading>
                    <VStack align="start" spacing={4} w="full">
                      <HStack justify="space-between" w="full">
                        <Text color="gray.400">Rate Type</Text>
                        <Text fontWeight="bold">
                          {providerRequest.pricingType || "Hourly"}
                        </Text>
                      </HStack>
                      <HStack justify="space-between" w="full">
                        <Text color="gray.400">Base Quote</Text>
                        <Text fontWeight="bold" color="green.400">
                          {providerRequest.baseRate || "AED 50/hr"}
                        </Text>
                      </HStack>
                      <HStack justify="space-between" w="full">
                        <Text color="gray.400">On-site Fee</Text>
                        <Text fontWeight="bold">
                          {providerRequest.onSiteCharges || "Included"}
                        </Text>
                      </HStack>
                    </VStack>
                  </VStack>
                </Box>
              )}
            </Stack>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
}

// --- SUB-COMPONENTS ---

const SectionWrapper = ({ title, icon, children }) => (
  <MotionBox
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
  >
    <HStack spacing={4} mb={6}>
      <Flex p={3} bg="green.50" borderRadius="2xl" color="green.500">
        <Icon as={icon} boxSize={6} />
      </Flex>
      <Heading size="lg" color="gray.800" letterSpacing="tight">
        {title}
      </Heading>
    </HStack>
    <Box>{children}</Box>
  </MotionBox>
);

const FeatureCardSmall = ({ icon, label, value }) => (
  <HStack
    bg="white"
    p={5}
    borderRadius="2xl"
    spacing={4}
    border="1px solid"
    borderColor="gray.100"
    boxShadow="sm"
    _hover={{
      borderColor: "green.200",
      boxShadow: "md",
      transform: "translateY(-2px)",
    }}
    transition="all 0.3s"
  >
    <Flex p={3} bg="green.50" borderRadius="xl" color="green.500">
      <Icon as={icon} boxSize={5} />
    </Flex>
    <VStack align="start" spacing={0}>
      <Text
        fontSize="xs"
        fontWeight="bold"
        color="gray.400"
        textTransform="uppercase"
      >
        {label}
      </Text>
      <Text fontSize="md" fontWeight="bold" color="gray.700">
        {value}
      </Text>
    </VStack>
  </HStack>
);

const SidebarStat = ({ label, value, icon, color }) => (
  <VStack spacing={2} align="center">
    <HStack color={color} spacing={1}>
      <Icon as={icon} boxSize={5} />
      <Text fontSize="xl" fontWeight="900" color="gray.800">
        {value}
      </Text>
    </HStack>
    <Text
      fontSize="xs"
      fontWeight="bold"
      color="gray.400"
      textTransform="uppercase"
    >
      {label}
    </Text>
  </VStack>
);

const DetailItem = ({ label, value, icon }) => (
  <HStack justify="space-between" w="full" py={1}>
    <HStack spacing={3} color="gray.400">
      <Icon as={icon} boxSize={4} />
      <Text fontSize="sm" fontWeight="medium">
        {label}
      </Text>
    </HStack>
    <Text fontSize="sm" fontWeight="bold" color="gray.700">
      {value}
    </Text>
  </HStack>
);
