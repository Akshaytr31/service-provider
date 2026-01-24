"use client";

import {
  Box,
  Button,
  Container,
  Heading,
  SimpleGrid,
  Text,
  VStack,
  Flex,
  Icon,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { SearchIcon, EditIcon } from "@chakra-ui/icons";

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);

export default function RoleSelectionPage() {
  const router = useRouter();

  const handleRoleSelect = (role) => {
    if (role === "seeker") {
      router.push("/seeker/seeker-onboarding");
    } else {
      router.push("/provider-onboarding");
    }
  };

  return (
    <Box
      minH="100vh"
      w="100%"
      bg="gray.50"
      position="relative"
      overflow="hidden"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      {/* Background Decorative Blobs */}
      <MotionBox
        position="absolute"
        top="-10%"
        right="-5%"
        w="500px"
        h="500px"
        bgGradient="radial(green.50, transparent)"
        borderRadius="full"
        filter="blur(100px)"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.4, 0.3],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />

      <Container maxW="container.xl" position="relative" zIndex={1} py={10}>
        <MotionVStack spacing={10} textAlign="center">
          <VStack spacing={3}>
            <MotionHeading
              fontSize={{ base: "2xl", md: "4xl" }}
              fontWeight="extrabold"
              color="gray.800"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Choose Your{" "}
              <Text as="span" color="green.500">
                Journey
              </Text>
            </MotionHeading>
            <MotionText
              fontSize={{ base: "sm", md: "md" }}
              color="gray.500"
              fontWeight="medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Select your path to continue on our platform
            </MotionText>
          </VStack>

          <SimpleGrid
            columns={{ base: 1, md: 2 }}
            spacing={8}
            w="100%"
            maxW="850px"
          >
            {/* SEEKER CARD */}
            <RoleCard
              title="I’m a Seeker"
              description="Find and book world-class services from trusted professionals."
              icon={SearchIcon}
              delay={0.3}
              onClick={() => handleRoleSelect("seeker")}
            />

            {/* PROVIDER CARD */}
            <RoleCard
              title="I’m a Provider"
              description="Offer your services, grow your business, and reach customers."
              icon={EditIcon}
              delay={0.4}
              onClick={() => handleRoleSelect("provider")}
            />
          </SimpleGrid>
        </MotionVStack>
      </Container>
    </Box>
  );
}

function RoleCard({ title, description, icon, delay, onClick }) {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ transform: "translateY(-5px)" }}
      h="100%"
    >
      <Box
        p={8}
        bg="white"
        borderRadius="2xl"
        cursor="pointer"
        border="1px solid"
        borderColor="gray.100"
        boxShadow="sm"
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        h="100%"
        display="flex"
        flexDirection="column"
        alignItems="center"
        textAlign="center"
        onClick={onClick}
        _hover={{
          borderColor: "green.200",
          boxShadow: "0 15px 30px rgba(72, 187, 120, 0.08)",
          "& .icon-box": { bg: "green.500", color: "white" },
        }}
      >
        <Flex
          className="icon-box"
          w="60px"
          h="60px"
          bg="green.50"
          color="green.500"
          borderRadius="xl"
          align="center"
          justify="center"
          mb={6}
          transition="all 0.3s"
        >
          <Icon as={icon} boxSize={6} />
        </Flex>

        <VStack spacing={2} flex={1}>
          <Heading size="md" fontWeight="bold" color="gray.800">
            {title}
          </Heading>
          <Text color="gray.500" fontSize="sm" lineHeight="base">
            {description}
          </Text>
        </VStack>

        <Button
          mt={8}
          w="full"
          size="md"
          variant="outline"
          colorScheme="green"
          borderRadius="xl"
          fontWeight="bold"
          _hover={{ bg: "green.500", color: "white" }}
          transition="all 0.2s"
        >
          Get Started
        </Button>
      </Box>
    </MotionBox>
  );
}
