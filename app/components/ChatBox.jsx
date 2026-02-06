"use client";

import {
  Box,
  Flex,
  Text,
  VStack,
  HStack,
  Input,
  IconButton,
  Avatar,
  Spinner,
  useToast,
  Divider,
} from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import { FiSend, FiX, FiMinimize2, FiMaximize2 } from "react-icons/fi";
import { useSession } from "next-auth/react";

export default function ChatBox({
  otherUserId,
  otherUserName,
  otherUserAvatar,
  isOpen,
  onClose,
}) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const bottomRef = useRef(null);
  const toast = useToast();
  const pollIntervalRef = useRef(null);

  const currentUserId = session?.user?.id;

  // Polling logic
  useEffect(() => {
    if (isOpen && otherUserId && currentUserId) {
      setLoading(true);
      fetchMessages();

      pollIntervalRef.current = setInterval(() => {
        fetchMessages(true); // Silent update
      }, 3000);
    } else {
      setMessages([]);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [isOpen, otherUserId, currentUserId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (!loading && isOpen && !isMinimized) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized, loading]);

  const fetchMessages = async (silent = false) => {
    if (!otherUserId) return;
    try {
      // Pass lastId to optimize if needed, but for now simple full fetch or since timestamp
      // Simplified: just fetch all for this conversation for V1
      const res = await fetch(`/api/messages?otherUserId=${otherUserId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Failed to fetch messages", error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUserId) return;

    // Optimistic update
    const tempMsg = {
      id: "temp-" + Date.now(),
      content: newMessage,
      senderId: parseInt(currentUserId),
      createdAt: new Date().toISOString(),
      sender: {
        id: currentUserId,
        name: session.user.name,
        image: session.user.image,
      },
    };

    setMessages((prev) => [...prev, tempMsg]);
    setNewMessage("");

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: otherUserId,
          content: tempMsg.content,
        }),
      });

      if (res.ok) {
        // Refresh to get real ID and confirmed state
        fetchMessages(true);
      } else {
        toast({ title: "Failed to send message", status: "error" });
        // Remove temp message if failed? Or show error state.
      }
    } catch (error) {
      console.error("Send error", error);
      toast({ title: "Failed to send message", status: "error" });
    }
  };

  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      bottom={4}
      right={4}
      w="350px"
      bg="white"
      borderRadius="xl"
      boxShadow="2xl"
      zIndex="1500"
      overflow="hidden"
      border="1px solid"
      borderColor="gray.200"
      display={isOpen ? "block" : "none"}
    >
      {/* Header */}
      <Flex
        bg="green.600"
        p={3}
        align="center"
        justify="space-between"
        color="white"
        onClick={() => setIsMinimized(!isMinimized)}
        cursor="pointer"
        borderTopRadius="xl"
      >
        <HStack>
          <Avatar
            size="sm"
            src={otherUserAvatar}
            name={otherUserName}
            bg="whiteAlpha.300"
            color="white"
          />
          <Text fontWeight="bold" fontSize="sm" isTruncated maxW="150px">
            {otherUserName || "Chat"}
          </Text>
        </HStack>
        <HStack spacing={1}>
          <IconButton
            size="xs"
            variant="ghost"
            icon={isMinimized ? <FiMaximize2 /> : <FiMinimize2 />}
            color="white"
            _hover={{ bg: "whiteAlpha.200" }}
            aria-label="Minimize"
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
          />
          <IconButton
            size="xs"
            variant="ghost"
            icon={<FiX />}
            color="white"
            _hover={{ bg: "whiteAlpha.200" }}
            aria-label="Close"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          />
        </HStack>
      </Flex>

      {/* Body */}
      {!isMinimized && (
        <>
          <Box h="350px" overflowY="auto" p={3} bg="gray.50">
            {loading && messages.length === 0 ? (
              <Flex h="full" justify="center" align="center">
                <Spinner color="green.500" />
              </Flex>
            ) : messages.length === 0 ? (
              <Flex
                h="full"
                direction="column"
                justify="center"
                align="center"
                color="gray.400"
              >
                <Text fontSize="sm">No messages yet.</Text>
                <Text fontSize="xs">Say hello!</Text>
              </Flex>
            ) : (
              <VStack spacing={3} align="stretch">
                {messages.map((msg) => {
                  const isMe = msg.senderId === parseInt(currentUserId);
                  return (
                    <Flex
                      key={msg.id}
                      justify={isMe ? "flex-end" : "flex-start"}
                    >
                      <Box
                        maxW="80%"
                        bg={isMe ? "green.500" : "white"}
                        color={isMe ? "white" : "gray.800"}
                        px={3}
                        py={2}
                        borderRadius="lg"
                        borderTopRightRadius={isMe ? "0" : "lg"}
                        borderTopLeftRadius={isMe ? "lg" : "0"}
                        boxShadow="sm"
                      >
                        <Text fontSize="sm">{msg.content}</Text>
                        <Text
                          fontSize="xx-small"
                          color={isMe ? "whiteAlpha.800" : "gray.400"}
                          mt={1}
                          textAlign="right"
                        >
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Text>
                      </Box>
                    </Flex>
                  );
                })}
                <div ref={bottomRef} />
              </VStack>
            )}
          </Box>

          <Divider />

          {/* Input Area */}
          <Flex p={3} gap={2} bg="white">
            <Input
              placeholder="Type a message..."
              size="sm"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              borderRadius="full"
            />
            <IconButton
              size="sm"
              colorScheme="green"
              icon={<FiSend />}
              onClick={handleSendMessage}
              borderRadius="full"
              isDisabled={!newMessage.trim()}
              aria-label="Send"
            />
          </Flex>
        </>
      )}
    </Box>
  );
}
