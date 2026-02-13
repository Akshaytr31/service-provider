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
} from "@chakra-ui/react";
import { FiMessageSquare } from "react-icons/fi";
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
    <Popover placement="bottom-end">
      {({ isOpen }) => (
        <>
          <PopoverTrigger>
            <Box position="relative" display="inline-block">
              <IconButton
                variant="ghost"
                icon={<FiMessageSquare size={20} />} // Corrected size prop usage or rely on icon's size
                color="gray.600"
                borderRadius="full"
                _hover={{ bg: "green.50", color: "green.600" }}
                aria-label="Messages"
              />
              {!isOpen && unreadCount > 0 && (
                <Badge
                  position="absolute"
                  top="-1px"
                  right="-1px"
                  bg="green"
                  color="white"
                  borderRadius="full"
                  boxSize="18px"
                  fontSize="10px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  // border="2px solid white"
                 padding={"3px 8px"}
                >
                  {unreadCount}
                </Badge>
              )}
            </Box>
          </PopoverTrigger>
          <PopoverContent
            w="350px"
            borderRadius="xl"
            boxShadow="xl"
            _focus={{ outline: "none" }}
          >
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverHeader fontWeight="bold" borderBottomWidth="0">
              Messages
            </PopoverHeader>
            <PopoverBody p={0} maxH="400px" overflowY="auto">
              {loading ? (
                <Flex justify="center" p={4}>
                  <Spinner color="green.500" />
                </Flex>
              ) : conversations.length === 0 ? (
                <Box p={6} textAlign="center">
                  <Text color="gray.500" fontSize="sm">
                    No messages yet
                  </Text>
                </Box>
              ) : (
                <VStack spacing={0} align="stretch" divider={<Divider />}>
                  {conversations.map((conv) => (
                    <HStack
                      key={conv.id}
                      p={3}
                      _hover={{ bg: "gray.50" }}
                      cursor="pointer"
                      transition="bg 0.2s"
                      onClick={() => handleChatClick(conv.user)}
                    >
                      <Avatar
                        size="sm"
                        name={conv.user.name}
                        src={conv.user.image}
                      />
                      <Box flex="1" overflow="hidden">
                        <Flex justify="space-between" align="center" mb={0.5}>
                          <Text fontWeight="bold" fontSize="sm" isTruncated>
                            {conv.user.name}
                          </Text>
                          <Text fontSize="xs" color="gray.400">
                            {new Date(conv.timestamp).toLocaleDateString(
                              undefined,
                              { month: "short", day: "numeric" },
                            )}
                          </Text>
                        </Flex>
                        <Text fontSize="xs" color="gray.500" isTruncated>
                          {conv.lastMessage}
                        </Text>
                      </Box>
                    </HStack>
                  ))}
                </VStack>
              )}
            </PopoverBody>
          </PopoverContent>
        </>
      )}
    </Popover>
  );
}
