"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Heading,
  Icon,
  Spinner,
  VStack,
  Text,
  Avatar,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import { FiArrowLeft, FiArrowRight, FiMessageSquare } from "react-icons/fi";
import { useSearch } from "@/app/context/SearchContext";

export default function MessagesView({ onBack, onSelectChat }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { searchQuery } = useSearch();

  useEffect(() => {
    async function fetchConversations() {
      try {
        const res = await fetch("/api/messages");
        if (res.ok) {
          const data = await res.json();
          // API returns array of users with lastMessage property mixed in
          const formatted = Array.isArray(data)
            ? data.map((item) => ({
                id: item.id,
                user: item.user,
                lastMessage: item.lastMessage,
                timestamp: item.timestamp,
              }))
            : [];
          setConversations(formatted);
        }
      } catch (error) {
        console.error("Failed to fetch messages", error);
      } finally {
        setLoading(false);
      }
    }
    fetchConversations();
  }, []);

  return (
    <Box mt={6}>
      <Flex align="center" mb={6}>
        <IconButton
          icon={<FiArrowLeft />}
          variant="ghost"
          onClick={onBack}
          mr={4}
          aria-label="Back"
        />
        <Heading size="lg" color="green.700">
          Messages
        </Heading>
      </Flex>

      {loading ? (
        <Flex justify="center" p={10}>
          <Spinner color="green.500" size="xl" />
        </Flex>
      ) : conversations.length === 0 ? (
        <Flex
          direction="column"
          align="center"
          justify="center"
          bg="white"
          p={12}
          borderRadius="2xl"
          boxShadow="sm"
          border="1px solid"
          borderColor="gray.100"
        >
          <Icon as={FiMessageSquare} boxSize={12} color="gray.300" mb={4} />
          <Text color="gray.500" fontSize="lg">
            No messages yet
          </Text>
          <Text color="gray.400" fontSize="sm">
            When seekers contact you, they will appear here.
          </Text>
        </Flex>
      ) : (
        <VStack align="stretch" spacing={4}>
          {conversations
            .filter((conv) => {
              if (!searchQuery.trim()) return true;
              const q = searchQuery.toLowerCase();
              return (
                conv.user?.name?.toLowerCase().includes(q) ||
                conv.lastMessage?.toLowerCase().includes(q)
              );
            })
            .map((conv) => (
              <Flex
                key={conv.id}
                onClick={() => onSelectChat(conv.user)}
                cursor="pointer"
                bg="white"
                p={5}
                borderRadius="xl"
                boxShadow="sm"
                border="1px solid"
                borderColor="gray.100"
                transition="all 0.2s"
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "md",
                  borderColor: "green.200",
                }}
                align="center"
              >
                <Avatar
                  size="md"
                  name={conv.user?.name || "Seeker"}
                  src={conv.user?.image}
                  mr={5}
                />

                <Box flex="1">
                  <Flex justify="space-between" align="center" mb={1}>
                    <HStack>
                      <Text fontWeight="bold" fontSize="lg" color="gray.800">
                        {conv.user?.name || "Unknown Seeker"}
                      </Text>
                    </HStack>
                    {conv.timestamp && (
                      <Text fontSize="xs" color="gray.400">
                        {new Date(conv.timestamp).toLocaleDateString()}
                      </Text>
                    )}
                  </Flex>

                  <Text color="gray.600" noOfLines={1} fontSize="md">
                    {conv.lastMessage || "No messages yet"}
                  </Text>
                </Box>

                <Icon as={FiArrowRight} color="gray.300" ml={4} />
              </Flex>
            ))}
        </VStack>
      )}
    </Box>
  );
}
