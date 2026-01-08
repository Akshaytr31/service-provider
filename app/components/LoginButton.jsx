"use client";

import { Button } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useAuth } from "../providerds";
import { auth } from "../firebase/firebase";
import { signOut } from "firebase/auth";

export default function LoginButton({ href = "/login" }) {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogin = () => {
    router.push(href);
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return user ? (
    <Button size="sm" colorScheme="red" onClick={handleLogout}>
      Logout
    </Button>
  ) : (
    <Button size="sm" colorScheme="blue" onClick={handleLogin}>
      Login
    </Button>
  );
}
