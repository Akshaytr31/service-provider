"use client";

import {
  Box,
  Flex,
  Button,
  IconButton,
  Stack,
  useDisclosure,
  Text,
  Avatar,
} from "@chakra-ui/react";
import {
  HamburgerIcon,
  CloseIcon,
  BellIcon,
  EmailIcon,
} from "@chakra-ui/icons";
import Link from "next/link";
import SearchBox from "./SearchBox";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "./ConfirmDialog";

export default function Navbar() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const { data: session, status } = useSession();

  const user = session?.user;

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <Box borderBottom="1px solid" borderColor="gray.200" bg="white">
      <Flex justify="space-between" p={3} align="center">
        {/* Logo + Search */}
        <Flex gap="30px" align="center">
          <Text fontSize="xl" fontWeight="bold" color="gray.800">
            NextApp
          </Text>
          <SearchBox />
        </Flex>

        {/* Desktop Menu */}
        <Flex gap="20px" align="center">
          <NavLink href="/">
            <BellIcon color="gray.500" boxSize={6} />
          </NavLink>

          <NavLink href="/">
            <EmailIcon color="gray.500" boxSize={6} />
          </NavLink>

          {/* USER / SEEKER */}
          {user?.role === "seeker" &&
            user?.providerRequestStatus === "none" && (
              <Button
                bg="transparent"
                _hover={{ bg: "gray.100" }}
                _active={{ bg: "gray.200" }}
                _focus={{ boxShadow: "none" }}
                size="sm"
                onClick={() => router.push("/provider-onboarding")}
              >
                Become a Provider
              </Button>
            )}

          {user?.role === "seeker" &&
            user?.providerRequestStatus === "pending" && (
              <Button
                size="sm"
                isDisabled
                bg="transparent"
                _hover={{ bg: "yellow.100" }}
                _active={{ bg: "yellow.200" }}
                _focus={{ boxShadow: "none" }}
              >
                Approval Pending
              </Button>
            )}

          {/* PROVIDER */}
          {user?.role === "provider" && (
            <Button
              bg="transparent"
              _hover={{ bg: "gray.100" }}
              _active={{ bg: "gray.200" }}
              _focus={{ boxShadow: "none" }}
              size="sm"
              onClick={() => router.push("/providerDashboard")}
            >
              Provider Dashboard
            </Button>
          )}

          {/* ADMIN */}
          {user?.role === "admin" && (
            <Button
              size="sm"
              bg="transparent"
              _hover={{ bg: "purple.100" }}
              _active={{ bg: "purple.200" }}
              _focus={{ boxShadow: "none" }}
              onClick={() => router.push("/adminDashboard")}
            >
              Admin Dashboard
            </Button>
          )}

          {/* AUTH / PROFILE ICON */}
          <Avatar
            size="sm"
            name={user?.email?.charAt(0).toUpperCase()}
            cursor="pointer"
            bg="blue.500"
            color="white"
            onClick={() => router.push("/profile")}
            fontWeight="800"
          />

          {/* AUTH */}
          {status === "loading" ? null : session ? (
            <>
              <Button colorScheme="gray" size="sm" onClick={onOpen}>
                Logout
              </Button>

              <ConfirmDialog
                isOpen={isOpen}
                onClose={onClose}
                onConfirm={handleLogout}
                title="Confirm Logout"
                message="Are you sure you want to logout?"
                confirmText="Logout"
                confirmColor="blue"
              />
            </>
          ) : (
            <Button onClick={() => router.push("/login")}>Sign In</Button>
          )}
        </Flex>

        {/* Mobile Menu Button */}
        <IconButton
          size="md"
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label="Toggle Menu"
          display={{ md: "none" }}
          onClick={isOpen ? onClose : onOpen}
        />
      </Flex>

      {/* Mobile Menu */}
      {isOpen && (
        <Box display={{ md: "none" }} px={4} pb={4}>
          <Stack spacing={4}>
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/about">About</NavLink>

            {session ? (
              <Button onClick={() => signOut({ callbackUrl: "/" })}>
                Log Out
              </Button>
            ) : (
              <Button onClick={() => router.push("/login")}>Sign In</Button>
            )}
          </Stack>
        </Box>
      )}
    </Box>
  );
}

/* Reusable NavLink */
function NavLink({ href, children }) {
  return (
    <Link href={href} className="text-gray-600 hover:text-blue-600 font-medium">
      {children}
    </Link>
  );
}
