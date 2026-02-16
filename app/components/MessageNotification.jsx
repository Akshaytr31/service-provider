"use client";

import {
  IconButton,
  Box,
  Badge,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  VStack,
  HStack,
  Text,
  Avatar,
  Spinner,
  Flex,
  Divider,
  Icon,
  Button,
} from "@chakra-ui/react";
import { FiMessageSquare, FiInbox } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

export default function MessageNotification({ onOpenChat }) {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const pollInterval = useRef(null);

  const fetchConversations = async (silent = false) => {
    if (!session) return;
    try {
      const res = await fetch("/api/messages");
      if (res.ok) {
        const data = await res.json();
        const formatted = Array.isArray(data)
          ? data.map((item) => ({
              id: item.id,
              user: {
                id: item.user.id,
                name: item.user.name,
                image: item.user.image,
              },
              lastMessage: item.lastMessage,
              timestamp: item.timestamp,
              unreadCount: item.unreadCount || 0,
            }))
          : [];

        // Sum up unread counts from all conversations
        const totalUnread = formatted.reduce(
          (sum, conv) => sum + conv.unreadCount,
          0,
        );

        setConversations(formatted);
        setUnreadCount(totalUnread);
      }
    } catch (error) {
      console.error("Failed to fetch messages", error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    pollInterval.current = setInterval(() => {
      fetchConversations(true);
    }, 10000); // Poll every 10s

    return () => clearInterval(pollInterval.current);
  }, [session]);

  const handleChatClick = (user) => {
    if (onOpenChat) onOpenChat(user);
  };

  if (!session) return null;

  return (
    <Popover placement="bottom-end" closeOnBlur={true}>
      {({ isOpen }) => (
        <>
          <PopoverTrigger>
            <Box position="relative" display="inline-block">
              <IconButton
                variant="ghost"
                icon={<FiMessageSquare size={22} />}
                color={isOpen ? "green.600" : "gray.500"}
                bg={isOpen ? "green.50" : "transparent"}
                borderRadius="full"
                _hover={{ bg: "green.50", color: "green.600" }}
                aria-label="Messages"
                size="md"
                transition="all 0.2s"
              />
              {!isOpen && unreadCount > 0 && (
                <Badge
                  position="absolute"
                  top="-2px"
                  right="-2px"
                  bg="green.500"
                  color="white"
                  borderRadius="full"
                  boxSize="18px"
                  fontSize="10px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  boxShadow="0 0 0 2px white"
                  border="none"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              )}
            </Box>
          </PopoverTrigger>
          <PopoverContent
            w="380px"
            borderRadius="2xl"
            boxShadow="0 10px 40px -10px rgba(0,0,0,0.15)"
            _focus={{ outline: "none" }}
            border="1px solid"
            borderColor="gray.100"
            overflow="hidden"
          >
            {/* <PopoverArrow /> */}
            <PopoverHeader
              fontWeight="bold"
              borderBottomWidth="1px"
              borderColor="gray.100"
              bg="white"
              py={4}
              px={5}
            >
              <Flex justify="space-between" align="center">
                <HStack spacing={2}>
                  <Text fontSize="md" color="gray.800">
                    Messages
                  </Text>
                  {unreadCount > 0 && (
                    <Badge colorScheme="green" borderRadius="full" px={2}>
                      {unreadCount} new
                    </Badge>
                  )}
                </HStack>
                {/* <Text fontSize="xs" color="green.600" cursor="pointer" fontWeight="medium">
                  Mark all read
                </Text> */}
              </Flex>
            </PopoverHeader>
            <PopoverBody p={0} maxH="450px" overflowY="auto" bg="gray.50">
              {loading ? (
                <Flex justify="center" align="center" h="200px" bg="white">
                  <Spinner color="green.500" thickness="3px" size="md" />
                </Flex>
              ) : conversations.length === 0 ? (
                <Flex
                  direction="column"
                  align="center"
                  justify="center"
                  py={12}
                  px={6}
                  bg="white"
                  textAlign="center"
                >
                  <Box
                    p={4}
                    bg="gray.50"
                    borderRadius="full"
                    mb={4}
                    color="gray.400"
                  >
                    <Icon as={FiInbox} boxSize={8} />
                  </Box>
                  <Text color="gray.800" fontWeight="semibold" mb={1}>
                    No messages yet
                  </Text>
                  <Text color="gray.500" fontSize="sm">
                    Start a conversation with a provider to see it here.
                  </Text>
                </Flex>
              ) : (
                <VStack spacing={0} align="stretch" bg="white">
                  {conversations.map((conv) => {
                    const isUnread = conv.unreadCount > 0;
                    return (
                      <Box
                        key={conv.id}
                        onClick={() => handleChatClick(conv.user)}
                        cursor="pointer"
                        transition="all 0.2s"
                        _hover={{ bg: "gray.50" }}
                        bg={isUnread ? "green.50" : "white"}
                        borderBottom="1px solid"
                        borderColor="gray.50"
                        px={5}
                        py={4}
                      >
                        <HStack spacing={4} align="start">
                          <Box position="relative">
                            <Avatar
                              size="md"
                              name={conv.user.name}
                              src={conv.user.image}
                              border={isUnread ? "2px solid" : "none"}
                              borderColor="green.400"
                            />
                            {isUnread && (
                              <Box
                                position="absolute"
                                bottom={0}
                                right={0}
                                w="12px"
                                h="12px"
                                bg="green.500"
                                borderRadius="full"
                                border="2px solid white"
                              />
                            )}
                          </Box>

                          <Box flex="1" overflow="hidden">
                            <Flex
                              justify="space-between"
                              align="baseline"
                              mb={1}
                            >
                              <Text
                                fontWeight={isUnread ? "800" : "600"}
                                fontSize="sm"
                                color="gray.900"
                                isTruncated
                                maxW="70%"
                              >
                                {conv.user.name}
                              </Text>
                              <Text
                                fontSize="xs"
                                color={isUnread ? "green.600" : "gray.400"}
                                fontWeight={isUnread ? "bold" : "normal"}
                              >
                                {new Date(conv.timestamp).toLocaleDateString(
                                  undefined,
                                  {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </Text>
                            </Flex>
                            <Flex justify="space-between" align="center">
                              <Text
                                fontSize="sm"
                                color={isUnread ? "gray.800" : "gray.500"}
                                isTruncated
                                fontWeight={isUnread ? "medium" : "normal"}
                                maxW="85%"
                              >
                                {conv.lastMessage}
                              </Text>
                              {isUnread && (
                                <Badge
                                  colorScheme="green"
                                  borderRadius="full"
                                  boxSize="18px"
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                  fontSize="xs"
                                >
                                  {conv.unreadCount}
                                </Badge>
                              )}
                            </Flex>
                          </Box>
                        </HStack>
                      </Box>
                    );
                  })}
                </VStack>
              )}
            </PopoverBody>
            <Box
              p={3}
              bg="gray.50"
              borderTop="1px solid"
              borderColor="gray.100"
            >
              <Button
                size="sm"
                variant="ghost"
                w="full"
                colorScheme="green"
                fontWeight="medium"
              >
                View all messages
              </Button>
            </Box>
          </PopoverContent>
        </>
      )}
    </Popover>
  );
}
