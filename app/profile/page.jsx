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
} from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user;

  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    role: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "Not provided",
        email: user.email || "",
        mobile: user.mobile || "Not provided",
        role: user.role || "",
      });
    }
  }, [user]);

  const handleSave = async () => {
    // TODO: connect backend API
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setForm({
        name: user.name || "Not provided",
        email: user.email || "",
        mobile: user.mobile || "Not provided",
        role: user.role || "",
      });
    }
  };

  if (!user) return null;

  return (
    <Box maxW="700px" mx="auto" mt={10} p={6}>
      {/* Header */}
      <Flex justify="space-between" align="center">
        <Heading size="lg">Profile</Heading>

        {!isEditing && (
          <IconButton
            icon={<EditIcon />}
            aria-label="Edit profile"
            onClick={() => setIsEditing(true)}
            variant="ghost"
          />
        )}
      </Flex>

      <Divider my={6} />

      {/* Avatar + Basic Info */}
      <Flex gap={6} align="center">
        <Avatar
          size="xl"
          bg="blue.500"
          color="white"
          name={user.email?.charAt(0).toUpperCase()}
        />

        <Stack spacing={1}>
          <Text fontSize="lg" fontWeight="bold">
            {form.name}
          </Text>
          <Text color="gray.500">{form.email}</Text>
          <Text fontSize="sm" color="gray.400">
            Role: {form.role}
          </Text>
        </Stack>
      </Flex>

      <Divider my={6} />

      {/* Details Section */}
      <Stack spacing={4}>
        {/* NAME */}
        <FormControl>
          <FormLabel>Name</FormLabel>
          {isEditing ? (
            <Input
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />
          ) : (
            <Text>{form.name}</Text>
          )}
        </FormControl>

        {/* EMAIL (READ ONLY ALWAYS) */}
        <FormControl>
          <FormLabel>Email</FormLabel>
          <Text>{form.email}</Text>
        </FormControl>

        {/* MOBILE */}
        <FormControl>
          <FormLabel>Mobile</FormLabel>
          {isEditing ? (
            <Input
              value={form.mobile}
              onChange={(e) =>
                setForm({ ...form, mobile: e.target.value })
              }
            />
          ) : (
            <Text>{form.mobile}</Text>
          )}
        </FormControl>
      </Stack>

      {/* ACTION BUTTONS */}
      {isEditing && (
        <Flex gap={4} mt={8} justify="flex-end">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSave}>
            Save Changes
          </Button>
        </Flex>
      )}
    </Box>
  );
}
