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
  Container,
  HStack,
  Divider,
  VStack,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HamburgerIcon,
  CloseIcon,
  BellIcon,
  EmailIcon,
} from "@chakra-ui/icons";
import Link from "next/link";
import SearchBox from "./SearchBox";
import { signOut, useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import ConfirmDialog from "./ConfirmDialog";

const MotionBox = motion(Box);

export default function Navbar() {
  const {
    isOpen: isMobileMenuOpen,
    onOpen: onMobileMenuOpen,
    onClose: onMobileMenuClose,
  } = useDisclosure();
  const {
    isOpen: isLogoutOpen,
    onOpen: onLogoutOpen,
    onClose: onLogoutClose,
  } = useDisclosure();
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const user = session?.user;

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      zIndex="999"
      bg="rgba(255, 255, 255, 0.7)"
      backdropFilter="blur(20px)"
      borderBottom="1px solid"
      borderColor="whiteAlpha.800"
      transition="all 0.3s ease"
    >
      <Container maxW="container.xl">
        <Flex justify="space-between" h="70px" align="center">
          {/* Logo + Search */}
          <HStack spacing={10}>
            <NavLink href="/">
              <Text
                fontSize="2xl"
                fontWeight="black"
                bgGradient="linear(to-r, green.600, green.400)"
                bgClip="text"
                letterSpacing="tighter"
                _hover={{ transform: "scale(1.02)" }}
                transition="all 0.2s"
              >
                NextApp
              </Text>
            </NavLink>
            <Box display={{ base: "none", md: "block" }}>
              <SearchBox />
            </Box>
          </HStack>

          {/* Desktop Menu */}
          <Flex gap={6} align="center" display={{ base: "none", md: "flex" }}>
            <HStack spacing={4}>
              <IconButton
                variant="ghost"
                icon={<BellIcon boxSize={5} />}
                color="gray.600"
                borderRadius="full"
                _hover={{ bg: "green.50", color: "green.600" }}
                aria-label="Notifications"
              />
              <IconButton
                variant="ghost"
                icon={<EmailIcon boxSize={5} />}
                color="gray.600"
                borderRadius="full"
                _hover={{ bg: "green.50", color: "green.600" }}
                aria-label="Messages"
              />
            </HStack>

            <Divider orientation="vertical" h="24px" borderColor="gray.200" />

            {/* USER / SEEKER ACTIONS */}
            {user?.role === "seeker" &&
              (user?.providerRequestStatus?.toLowerCase() === "none" ||
                !user?.providerRequestStatus) && (
                <Button
                  bg="green.500"
                  color="white"
                  _hover={{
                    bg: "green.600",
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 12px rgba(72, 187, 120, 0.3)",
                  }}
                  _active={{ transform: "translateY(0)" }}
                  size="sm"
                  px={5}
                  borderRadius="full"
                  onClick={() => router.push("/provider-onboarding")}
                  fontWeight="bold"
                >
                  Become a Provider
                </Button>
              )}

            {user?.role === "seeker" &&
              user?.providerRequestStatus?.toLowerCase() === "pending" && (
                <Button
                  size="sm"
                  isDisabled
                  bg="yellow.50"
                  color="yellow.700"
                  border="1px solid"
                  borderColor="yellow.200"
                  borderRadius="full"
                  px={5}
                >
                  Approval Pending
                </Button>
              )}

            {/* DASHBOARD BUTTONS */}
            {user?.role === "provider" &&
              (user.isProviderAtFirst ? (
                <Button
                  variant="outline"
                  borderColor="green.200"
                  color="green.600"
                  _hover={{ bg: "green.50" }}
                  size="sm"
                  borderRadius="full"
                  px={5}
                  onClick={() => router.push("/providerDashboard")}
                >
                  Provider Dashboard
                </Button>
              ) : pathname.startsWith("/providerDashboard") ? (
                <Button
                  variant="outline"
                  borderColor="green.200"
                  color="green.600"
                  _hover={{ bg: "green.50" }}
                  size="sm"
                  borderRadius="full"
                  px={5}
                  onClick={() => router.push("/")}
                >
                  Seeker Dashboard
                </Button>
              ) : (
                <Button
                  variant="outline"
                  borderColor="green.200"
                  color="green.600"
                  _hover={{ bg: "green.50" }}
                  size="sm"
                  borderRadius="full"
                  px={5}
                  onClick={() => router.push("/providerDashboard")}
                >
                  Provider Dashboard
                </Button>
              ))}

            {user?.role === "admin" && (
              <Button
                size="sm"
                bg="purple.500"
                color="white"
                borderRadius="full"
                px={5}
                _hover={{ bg: "purple.600" }}
                onClick={() => router.push("/adminDashboard")}
              >
                Admin Dashboard
              </Button>
            )}

            {/* PROFILE & AUTH */}
            {user?.role !== "none" && (
              <Avatar
                size="sm"
                name={user?.email?.charAt(0).toUpperCase()}
                src={user?.image}
                cursor="pointer"
                bg="green.500"
                color="white"
                onClick={() => router.push("/profile")}
                fontWeight="800"
                border="2px solid"
                borderColor="green.50"
                boxShadow="md"
              />
            )}

            {status === "loading" ? null : session && user?.role !== "none" ? (
              <>
                <Button
                  variant="ghost"
                  color="gray.600"
                  size="sm"
                  onClick={onLogoutOpen}
                  _hover={{ bg: "red.50", color: "red.500" }}
                >
                  Logout
                </Button>

                <ConfirmDialog
                  isOpen={isLogoutOpen}
                  onClose={onLogoutClose}
                  onConfirm={handleLogout}
                  title="Confirm Logout"
                  message="Are you sure you want to logout?"
                  confirmText="Logout"
                  confirmColor="red"
                />
              </>
            ) : (
              <Button
                bg="green.500"
                color="white"
                _hover={{ bg: "green.600" }}
                borderRadius="full"
                onClick={() => router.push("/login")}
              >
                Sign In
              </Button>
            )}
          </Flex>

          {/* Mobile Menu Button */}
          <IconButton
            size="md"
            variant="ghost"
            icon={isMobileMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label="Toggle Menu"
            display={{ md: "none" }}
            onClick={isMobileMenuOpen ? onMobileMenuClose : onMobileMenuOpen}
            color="green.600"
          />
        </Flex>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <MotionBox
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              display={{ md: "none" }}
              pb={8}
            >
              <Stack spacing={4} pt={4}>
                <Box px={2}>
                  <SearchBox />
                </Box>
                <VStack align="stretch" spacing={3}>
                  <NavLink href="/">Dashboard</NavLink>
                  <NavLink href="/profile">Profile</NavLink>
                  <Divider />
                  {session ? (
                    <Button
                      w="full"
                      colorScheme="red"
                      variant="ghost"
                      onClick={onLogoutOpen}
                    >
                      Log Out
                    </Button>
                  ) : (
                    <Button
                      w="full"
                      bg="green.500"
                      color="white"
                      onClick={() => router.push("/login")}
                    >
                      Sign In
                    </Button>
                  )}
                </VStack>
              </Stack>
            </MotionBox>
          )}
        </AnimatePresence>
      </Container>
    </Box>
  );
}

/* Reusable NavLink */
function NavLink({ href, children }) {
  return (
    <Link
      href={href}
      className="text-gray-600 hover:text-green-600 font-bold transition-all duration-200"
    >
      {children}
    </Link>
  );
}
