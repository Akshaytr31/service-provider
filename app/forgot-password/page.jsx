"use client";

import { Box, Center } from "@chakra-ui/react";
import ForgotPassword from "../components/ForgotPassword";

export default function ForgotPasswordPage() {
  return (
    <Box mt="100px" minH="80vh">
      <Center>
        <ForgotPassword />
      </Center>
    </Box>
  );
}
