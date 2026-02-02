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
} from "@chakra-ui/react";
import {
  InfoIcon,
  PhoneIcon,
  EmailIcon,
  CheckIcon,
  TimeIcon,
  StarIcon,
} from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FiBriefcase,
  FiMapPin,
  FiUser,
  FiAward,
  FiDollarSign,
} from "react-icons/fi";
import { useParams } from "next/navigation";

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

export default function PublicProfilePage() {
  const params = useParams();
  const { id } = params;
  const bg = useColorModeValue("white", "gray.800");

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

        setProfile(data.profile || {});
        setUser(data.user || {});
        setProviderRequest(data.providerRequest || null);
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
        <Text fontSize="xl" color="green.600" fontWeight="bold">
          Loading Profile...
        </Text>
      </Flex>
    );

  if (error || !user)
    return (
      <Flex h="100vh" align="center" justify="center" bg="gray.50">
        <VStack spacing={4}>
          <Heading size="lg" color="gray.400">
            Profile Not Found
          </Heading>
          <Text color="gray.500">
            The user you are looking for does not exist or is private.
          </Text>
        </VStack>
      </Flex>
    );

  // Helper for name display
  const displayName =
    profile?.firstName || profile?.lastName
      ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim()
      : user.name || "User";

  const isProvider = !!providerRequest;

  return (
    <Box minH="100vh" bg="gray.50" overflowX="hidden">
      {/* --- HERO SECTION --- */}
      <Box
        bgGradient="linear(to-br, green.600, teal.700)"
        color="white"
        pt={{ base: "80px", md: "120px" }}
        pb={{ base: "100px", md: "140px" }}
        position="relative"
        borderBottomRadius={{ base: "30px", md: "50px" }}
        overflow="hidden"
      >
        {/* Abstract Shapes */}
        <Box
          position="absolute"
          top="-20%"
          right="-10%"
          boxSize="400px"
          bg="whiteAlpha.100"
          borderRadius="full"
          filter="blur(60px)"
        />
        <Box
          position="absolute"
          bottom="-10%"
          left="-5%"
          boxSize="300px"
          bg="green.400"
          borderRadius="full"
          filter="blur(80px)"
          opacity={0.3}
        />

        <Container maxW="container.xl" position="relative" zIndex={1}>
          <MotionFlex
            direction={{ base: "column", md: "row" }}
            align="center"
            justify="space-between"
            gap={8}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <HStack spacing={6} align="center" flexWrap="wrap" justify="center">
              <Avatar
                size="2xl"
                name={displayName}
                src={user.image}
                border="4px solid white"
                boxShadow="2xl"
                w={{ base: "120px", md: "150px" }}
                h={{ base: "120px", md: "150px" }}
              />
              <Stack spacing={2} textAlign={{ base: "center", md: "left" }}>
                <Heading size="2xl" fontWeight="900" letterSpacing="tight">
                  {displayName}
                </Heading>
                <HStack
                  justify={{ base: "center", md: "flex-start" }}
                  spacing={3}
                >
                  {isProvider && (
                    <Badge
                      colorScheme="green"
                      fontSize="0.9em"
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      Verified Provider
                    </Badge>
                  )}
                  <Tag
                    size="lg"
                    colorScheme="whiteAlpha"
                    borderRadius="full"
                    variant="outline"
                    color="white"
                  >
                    <TagLabel>
                      {user.role === "seeker" && !isProvider
                        ? "Member"
                        : "Professional"}
                    </TagLabel>
                  </Tag>
                </HStack>
                {/* Location Pill */}
                {(profile?.city || providerRequest?.city) && (
                  <HStack
                    justify={{ base: "center", md: "flex-start" }}
                    color="green.100"
                    fontSize="lg"
                  >
                    <Icon as={FiMapPin} />
                    <Text>
                      {profile?.city || providerRequest?.city},{" "}
                      {profile?.country || providerRequest?.country}
                    </Text>
                  </HStack>
                )}
              </Stack>
            </HStack>

            {/* Quick Stats or CTA */}
            {isProvider && (
              <HStack spacing={8} display={{ base: "none", md: "flex" }}>
                <StatBox
                  label="Experience"
                  value={`${providerRequest.yearsExperience || "1+"} Years`}
                />
                <StatBox
                  label="Radius"
                  value={`${providerRequest.serviceRadius || "N/A"} km`}
                />
                <StatBox
                  label="Rate"
                  value={`${providerRequest.baseRate || "N/A"}`}
                />
              </HStack>
            )}
          </MotionFlex>
        </Container>
      </Box>

      {/* --- MAIN CONTENT AREA --- */}
      <Container
        maxW="container.lg"
        mt="-80px"
        position="relative"
        zIndex={2}
        pb={20}
      >
        <Stack spacing={8}>
          {/* 1. ABOUT CARD */}
          <SectionCard title="About" icon={FiUser} delay={0.2}>
            <Text fontSize="lg" color="gray.600" lineHeight="tall">
              {isProvider && providerRequest.description
                ? providerRequest.description
                : "No description provided."}
            </Text>

            {isProvider && providerRequest.userType === "business" && (
              <SimpleGrid
                columns={{ base: 1, md: 2 }}
                spacing={6}
                mt={6}
                bg="gray.50"
                p={6}
                borderRadius="xl"
              >
                <DetailRow
                  label="Business Name"
                  value={providerRequest.businessName}
                />
                <DetailRow
                  label="Establishment Year"
                  value={providerRequest.establishmentYear}
                />
                <DetailRow
                  label="Business Type"
                  value={providerRequest.businessType}
                />
              </SimpleGrid>
            )}
          </SectionCard>

          {/* 2. SERVICES & PRICING (Provider Only) */}
          {isProvider && (
            <SectionCard
              title="Services & Pricing"
              icon={FiDollarSign}
              delay={0.3}
            >
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                <FeatureCard
                  icon={FiBriefcase}
                  title="Pricing Model"
                  value={providerRequest.pricingType || "Standard"}
                />
                <FeatureCard
                  icon={FiDollarSign}
                  title="Base Rate"
                  value={providerRequest.baseRate || "Contact for Quote"}
                />
                <FeatureCard
                  icon={FiMapPin}
                  title="On-Site Charges"
                  value={providerRequest.onSiteCharges || "Included"}
                />
              </SimpleGrid>
            </SectionCard>
          )}

          {/* 3. LICENSES (Provider Only) */}
          {/* {isProvider &&
            providerRequest.licenses &&
            providerRequest.licenses.length > 0 && (
              <SectionCard
                title="Credentials & Licenses"
                icon={FiAward}
                delay={0.4}
              >
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {providerRequest.licenses.map((license, idx) => (
                    <Box
                      key={idx}
                      p={5}
                      border="1px solid"
                      borderColor="gray.100"
                      borderRadius="xl"
                      bg="green.50"
                      transition="all 0.2s"
                      _hover={{ shadow: "md" }}
                    >
                      <Flex justify="space-between" align="start">
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="bold" color="green.800">
                            {license.name}
                          </Text>
                          <Text fontSize="sm" color="green.600">
                            {license.authority}
                          </Text>
                          <Text fontSize="xs" color="green.500">
                            Expires: {license.expiry || "N/A"}
                          </Text>
                        </VStack>
                        {license.document?.secureUrl && (
                          <Button
                            as="a"
                            href={license.document.secureUrl}
                            target="_blank"
                            size="sm"
                            colorScheme="green"
                            variant="solid"
                            leftIcon={<Icon as={FiBriefcase} />}
                            borderRadius="full"
                          >
                            View
                          </Button>
                        )}
                      </Flex>
                    </Box>
                  ))}
                </SimpleGrid>
              </SectionCard>
            )} */}

          {/* 4. CONTACT / FOOTER */}
          <Box pt={10} textAlign="center">
            <Text color="gray.400" fontSize="sm" mb={4}>
              Interested in working with {displayName}?
            </Text>
            <Button
              size="lg"
              colorScheme="green"
              height="60px"
              px={8}
              fontSize="xl"
              borderRadius="full"
              boxShadow="0 10px 20px rgba(72, 187, 120, 0.3)"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "0 15px 30px rgba(72, 187, 120, 0.4)",
              }}
              onClick={() => (window.location.href = `mailto:${user.email}`)}
            >
              Contact via Email
            </Button>

            <Text mt={8} fontSize="xs" color="gray.300">
              Profile hosted on NextApp
            </Text>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}

// --- SUB-COMPONENTS ---

const SectionCard = ({ title, icon, children, delay }) => (
  <MotionBox
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    bg="white"
    p={{ base: 6, md: 8 }}
    borderRadius="3xl"
    boxShadow="0 4px 20px rgba(0,0,0,0.03)"
    border="1px solid"
    borderColor="gray.100"
  >
    <HStack spacing={3} mb={6}>
      <Flex
        boxSize="40px"
        bg="green.50"
        borderRadius="xl"
        align="center"
        justify="center"
      >
        <Icon as={icon} color="green.500" boxSize={5} />
      </Flex>
      <Heading size="md" color="gray.700">
        {title}
      </Heading>
    </HStack>
    {children}
  </MotionBox>
);

const FeatureCard = ({ icon, title, value }) => (
  <VStack
    bg="gray.50"
    p={6}
    borderRadius="2xl"
    align="center"
    spacing={3}
    border="1px dashed"
    borderColor="gray.200"
    transition="all 0.2s"
    _hover={{ bg: "green.50", borderColor: "green.200" }}
  >
    <Icon as={icon} color="gray.400" boxSize={6} />
    <Text
      fontSize="sm"
      color="gray.500"
      fontWeight="bold"
      textTransform="uppercase"
    >
      {title}
    </Text>
    <Text fontSize="xl" fontWeight="bold" color="gray.700">
      {value}
    </Text>
  </VStack>
);

const DetailRow = ({ label, value }) => (
  <Box>
    <Text
      fontSize="xs"
      fontWeight="bold"
      color="gray.400"
      textTransform="uppercase"
      mb={1}
    >
      {label}
    </Text>
    <Text fontSize="md" fontWeight="medium" color="gray.700">
      {value || "N/A"}
    </Text>
  </Box>
);

const StatBox = ({ label, value }) => (
  <VStack spacing={0} align="flex-start">
    <Text fontSize="2xl" fontWeight="900">
      {value}
    </Text>
    <Text
      fontSize="xs"
      opacity={0.8}
      fontWeight="bold"
      textTransform="uppercase"
    >
      {label}
    </Text>
  </VStack>
);
