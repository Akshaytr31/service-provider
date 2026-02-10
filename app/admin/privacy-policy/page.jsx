"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Button,
  Heading,
  Textarea,
  Spinner,
  useToast,
  Card,
  CardBody,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Flex,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
  Icon,
  Container,
  VStack,
  HStack,
  Divider,
  useColorModeValue,
  Avatar,
  Tooltip,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import {
  FaSave,
  FaUserCheck,
  FaUserClock,
  FaFileAlt,
  FaSearch,
  FaShieldAlt,
  FaHistory,
} from "react-icons/fa";
import { MdPolicy } from "react-icons/md";

export default function PrivacyPolicyAdminPage() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userStatus, setUserStatus] = useState({ providers: [], seekers: [] });
  const [lastUpdated, setLastUpdated] = useState(null);
  const toast = useToast();

  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [policyRes, statusRes] = await Promise.all([
          fetch("/api/admin/privacyPolicy"),
          fetch("/api/admin/privacy-policy/status"),
        ]);

        const policyData = await policyRes.json();
        const statusData = await statusRes.json();

        if (policyData?.content) {
          setContent(policyData.content);
          if (policyData.updatedAt) setLastUpdated(policyData.updatedAt);
        }

        if (statusData) {
          setUserStatus({
            providers: statusData.providers || [],
            seekers: statusData.seekers || [],
          });
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast({
          title: "Failed to load data",
          description: "Could not fetch privacy policy or user status.",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/admin/privacyPolicy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) throw new Error("Save failed");

      setLastUpdated(new Date().toISOString());
      toast({
        title: "Policy Updated",
        description: "Privacy policy changes have been saved successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } catch (error) {
      console.error("Failed to save:", error);
      toast({
        title: "Save Failed",
        description: "Something went wrong while saving.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  // Calculate Stats
  const stats = useMemo(() => {
    const totalProviders = userStatus.providers.length;
    const acceptedProviders = userStatus.providers.filter(
      (u) => u.isAccepted,
    ).length;
    const totalSeekers = userStatus.seekers.length;
    const acceptedSeekers = userStatus.seekers.filter(
      (u) => u.isAccepted,
    ).length;

    const providerRate = totalProviders
      ? ((acceptedProviders / totalProviders) * 100).toFixed(1)
      : 0;
    const seekerRate = totalSeekers
      ? ((acceptedSeekers / totalSeekers) * 100).toFixed(1)
      : 0;

    return {
      totalProviders,
      acceptedProviders,
      providerRate,
      totalSeekers,
      acceptedSeekers,
      seekerRate,
    };
  }, [userStatus]);

  if (loading) {
    return (
      <Flex h="80vh" align="center" justify="center">
        <Spinner
          size="xl"
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
        />
      </Flex>
    );
  }

  return (
    <Box
      minH="100vh"
      bg={useColorModeValue("gray.50", "gray.900")}
      py={8}
      px={6}
      pt={30}
      marginTop={20}
    >
      <Container maxW="7xl">
        {/* Header Section */}
        <Flex
          justify="space-between"
          align="center"
          mb={10}
          wrap="wrap"
          gap={4}
        >
          <Box>
            <Heading
              size="xl"
              mb={2}
              bgGradient="linear(to-r, blue.400, purple.500)"
              bgClip="text"
            >
              Privacy Policy Center
            </Heading>
            <Text color="gray.500" fontSize="lg">
              Manage content and track user acceptance in real-time.
            </Text>
          </Box>
          <HStack spacing={4}>
            {lastUpdated && (
              <Badge
                colorScheme="purple"
                p={2}
                borderRadius="md"
                variant="subtle"
              >
                <Icon as={FaHistory} mr={2} />
                Last Updated: {new Date(lastUpdated).toLocaleDateString()}
              </Badge>
            )}
            <Button
              leftIcon={<FaSave />}
              colorScheme="blue"
              onClick={handleSave}
              isLoading={saving}
              loadingText="Saving..."
              size="lg"
              shadow="lg"
              _hover={{ transform: "translateY(-2px)", shadow: "xl" }}
              transition="all 0.2s"
            >
              Publish Changes
            </Button>
          </HStack>
        </Flex>

        {/* Stats Grid */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={10}>
          <StatsCard
            title="Total Providers"
            stat={stats.totalProviders}
            icon={FaUserCheck}
            color="blue.400"
            helpText={`${stats.acceptedProviders} Accepted`}
          />
          <StatsCard
            title="Provider Acceptance"
            stat={`${stats.providerRate}%`}
            icon={MdPolicy}
            color="green.400"
            helpText="Compliance Rate"
            type="increase"
          />
          <StatsCard
            title="Total Seekers"
            stat={stats.totalSeekers}
            icon={FaUserClock}
            color="purple.400"
            helpText={`${stats.acceptedSeekers} Accepted`}
          />
          <StatsCard
            title="Seeker Acceptance"
            stat={`${stats.seekerRate}%`}
            icon={FaShieldAlt}
            color="orange.400"
            helpText="Compliance Rate"
            type="increase"
          />
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
          {/* Editor Section - Takes up 2/3 on large screens */}
          <Box gridColumn={{ lg: "span 2" }}>
            <Card
              shadow="xl"
              borderRadius="2xl"
              border="1px"
              borderColor={borderColor}
              bg={cardBg}
              overflow="hidden"
            >
              <CardBody p={0}>
                <Flex
                  p={6}
                  borderBottom="1px"
                  borderColor={borderColor}
                  justify="space-between"
                  align="center"
                  bg={useColorModeValue("gray.50", "gray.800")}
                >
                  <Heading size="md" display="flex" alignItems="center" gap={2}>
                    <Icon as={FaFileAlt} color="blue.500" />
                    Policy Editor
                  </Heading>
                  <Tooltip label="Markdown is supported" hasArrow>
                    <Badge>MARKDOWN SUPPORTED</Badge>
                  </Tooltip>
                </Flex>
                <Box p={6}>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    minH="500px"
                    fontSize="sm"
                    fontFamily="monospace"
                    bg={useColorModeValue("white", "gray.900")}
                    borderColor={useColorModeValue("gray.300", "gray.600")}
                    _focus={{
                      borderColor: "blue.400",
                      boxShadow: "0 0 0 1px #4299E1",
                    }}
                    placeholder="# Privacy Policy\n\nWrite your policy here..."
                    p={4}
                    borderRadius="md"
                  />
                </Box>
              </CardBody>
            </Card>
          </Box>

          {/* User Status Section - Takes up 1/3 on large screens */}
          <Box gridColumn={{ lg: "span 1" }}>
            <Card
              shadow="xl"
              borderRadius="2xl"
              border="1px"
              borderColor={borderColor}
              bg={cardBg}
              h="full"
            >
              <CardBody p={0}>
                <Tabs variant="line" colorScheme="blue" isFitted>
                  <TabList
                    px={4}
                    pt={4}
                    borderBottom="1px"
                    borderColor={borderColor}
                  >
                    <Tab
                      fontWeight="bold"
                      _selected={{ color: "blue.500", borderColor: "blue.500" }}
                    >
                      Providers
                    </Tab>
                    <Tab
                      fontWeight="bold"
                      _selected={{ color: "blue.500", borderColor: "blue.500" }}
                    >
                      Seekers
                    </Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel p={0}>
                      <UserList users={userStatus.providers} />
                    </TabPanel>
                    <TabPanel p={0}>
                      <UserList users={userStatus.seekers} />
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </CardBody>
            </Card>
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  );
}

const StatsCard = ({ title, stat, icon, color, helpText, type }) => {
  return (
    <Card
      shadow="lg"
      borderRadius="xl"
      transition="all 0.2s"
      _hover={{ transform: "translateY(-4px)", shadow: "2xl" }}
      borderLeft="4px solid"
      borderColor={color}
    >
      <CardBody>
        <Flex justify="space-between" align="start">
          <Stat>
            <StatLabel fontSize="sm" color="gray.500" fontWeight="medium">
              {title}
            </StatLabel>
            <StatNumber fontSize="2xl" fontWeight="bold" color="gray.700">
              {stat}
            </StatNumber>
            <StatHelpText mb={0}>
              {type === "increase" && (
                <StatArrow type="increase" color={color} />
              )}
              {helpText}
            </StatHelpText>
          </Stat>
          <Box p={2} bg={`${color.split(".")[0]}.50`} borderRadius="lg">
            <Icon as={icon} w={6} h={6} color={color} />
          </Box>
        </Flex>
      </CardBody>
    </Card>
  );
};

const UserList = ({ users }) => {
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    if (!search) return users;
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [users, search]);

  return (
    <Box>
      <Box p={4} borderBottom="1px" borderColor="gray.100">
        <InputGroup size="sm">
          <InputLeftElement pointerEvents="none">
            <Icon as={FaSearch} color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            borderRadius="full"
          />
        </InputGroup>
      </Box>

      <Box
        maxH="600px"
        overflowY="auto"
        css={{
          "&::-webkit-scrollbar": { width: "4px" },
          "&::-webkit-scrollbar-track": { width: "6px" },
          "&::-webkit-scrollbar-thumb": {
            background: "#CBD5E0",
            borderRadius: "24px",
          },
        }}
      >
        {filteredUsers.length === 0 ? (
          <Flex
            direction="column"
            align="center"
            justify="center"
            p={8}
            color="gray.500"
          >
            <Icon as={FaSearch} w={8} h={8} mb={2} opacity={0.3} />
            <Text fontSize="sm">No users found</Text>
          </Flex>
        ) : (
          <Table variant="simple" size="sm">
            <Thead position="sticky" top={0} bg="white" zIndex={1}>
              <Tr>
                <Th>User</Th>
                <Th isNumeric>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredUsers.map((user) => (
                <Tr
                  key={user.id}
                  _hover={{ bg: "gray.50" }}
                  transition="background 0.2s"
                >
                  <Td>
                    <HStack spacing={3}>
                      <Avatar
                        size="xs"
                        name={user.name || "User"}
                        bg="blue.500"
                        color="white"
                      />
                      <Box>
                        <Text
                          fontWeight="bold"
                          fontSize="sm"
                          isTruncated
                          maxW="150px"
                        >
                          {user.name || "N/A"}
                        </Text>
                        <Text
                          fontSize="xs"
                          color="gray.500"
                          isTruncated
                          maxW="150px"
                        >
                          {user.email}
                        </Text>
                      </Box>
                    </HStack>
                  </Td>
                  <Td isNumeric>
                    <VStack align="flex-end" spacing={0}>
                      <Badge
                        colorScheme={user.isAccepted ? "green" : "red"}
                        borderRadius="full"
                        px={2}
                        fontSize="10px"
                      >
                        {user.isAccepted ? "ACCEPTED" : "PENDING"}
                      </Badge>
                      {user.acceptedAt && (
                        <Text fontSize="9px" color="gray.400" mt={1}>
                          {new Date(user.acceptedAt).toLocaleDateString()}
                        </Text>
                      )}
                    </VStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Box>
    </Box>
  );
};
