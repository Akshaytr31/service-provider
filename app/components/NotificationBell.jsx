"use client";

import {
  Box,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  Badge,
  VStack,
  HStack,
  Icon,
  Divider,
  Button,
} from "@chakra-ui/react";
import { FiBell, FiCheckCircle, FiXCircle, FiInfo } from "react-icons/fi";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark read", error);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: [notification.id] }),
        });
        fetchNotifications();
      } catch (error) {
        console.error("Failed to mark read", error);
      }
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  return (
    <Box position="relative">
      <Menu onOpen={markAllAsRead} closeOnSelect={false}>
        <MenuButton
          as={IconButton}
          icon={<FiBell size={20} />}
          variant="ghost"
          borderRadius="full"
          aria-label="Notifications"
          position="relative"
          _hover={{ bg: "green.50", color: "green.600" }}
        />
        {unreadCount > 0 && (
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
        <MenuList
          maxH="400px"
          overflowY="auto"
          w={{ base: "300px", md: "360px" }}
          p={0}
          shadow="lg"
          borderRadius="xl"
        >
          <Box
            p={3}
            bg="gray.50"
            borderBottom="1px solid"
            borderColor="gray.100"
          >
            <HStack justify="space-between">
              <Text fontWeight="bold" fontSize="sm">
                Notifications
              </Text>
              {unreadCount > 0 && (
                <Text
                  fontSize="xs"
                  color="green.600"
                  cursor="pointer"
                  onClick={markAllAsRead}
                >
                  Mark all as read
                </Text>
              )}
            </HStack>
          </Box>

          {notifications.length === 0 ? (
            <Box p={8} textAlign="center">
              <Text color="gray.500" fontSize="sm">
                No notifications yet
              </Text>
            </Box>
          ) : (
            <VStack spacing={0} align="stretch">
              {notifications.map((notif) => (
                <MenuItem
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  bg={notif.isRead ? "white" : "green.50"}
                  _hover={{ bg: "gray.50" }}
                  borderBottom="1px solid"
                  borderColor="gray.50"
                  py={3}
                >
                  <HStack align="start" spacing={3} w="full">
                    <Box mt={1}>
                      {notif.message.includes("accepted") ||
                      notif.message.includes("good news") ? (
                        <Icon as={FiCheckCircle} color="green.500" />
                      ) : notif.message.includes("rejected") ? (
                        <Icon as={FiXCircle} color="red.500" />
                      ) : (
                        <Icon as={FiInfo} color="blue.500" />
                      )}
                    </Box>
                    <VStack align="start" spacing={1} flex={1}>
                      <Text fontSize="sm" color="gray.800" noOfLines={3}>
                        {notif.message}
                      </Text>
                      <Text fontSize="xs" color="gray.400">
                        {new Date(notif.createdAt).toLocaleDateString()} •{" "}
                        {new Date(notif.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </VStack>
                    {!notif.isRead && (
                      <Box boxSize="8px" bg="green.500" rounded="full" />
                    )}
                  </HStack>
                </MenuItem>
              ))}
            </VStack>
          )}
        </MenuList>
      </Menu>
    </Box>
  );
}
