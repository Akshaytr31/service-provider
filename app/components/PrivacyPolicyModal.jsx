"use client";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  Box,
} from "@chakra-ui/react";
import { useState } from "react";

export default function PrivacyPolicyModal({
  isOpen,
  onClose,
  policyContent,
  onAcceptSuccess,
}) {
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/accept-privacy-policy", {
        method: "POST",
      });
      if (res.ok) {
        if (onAcceptSuccess) {
          onAcceptSuccess();
        } else {
          onClose();
        }
      }
    } catch (error) {
      console.error("Failed to accept policy:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      isCentered
      scrollBehavior="inside"
    >
      <ModalOverlay backdropFilter="blur(5px)" />
      <ModalContent>
        <ModalHeader
          borderBottomWidth="1px"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Text>Privacy Policy Update</Text>
          {/* Close button added as requested */}
          <Button size="sm" onClick={onClose} variant="ghost">
            X
          </Button>
        </ModalHeader>
        <ModalBody py={6}>
          <Text mb={4} fontWeight="medium">
            We have updated our Privacy Policy. Please review and accept the
            changes.
          </Text>
          <Box
            p={4}
            bg="gray.50"
            borderRadius="md"
            border="1px solid"
            borderColor="gray.200"
            maxH="400px"
            overflowY="auto"
            fontSize="sm"
            whiteSpace="pre-wrap"
          >
            {policyContent}
          </Box>
        </ModalBody>
        <ModalFooter borderTopWidth="1px">
          <Button variant="ghost" mr={3} onClick={onClose}>
            Close
          </Button>
          <Button
            colorScheme="green"
            onClick={handleAccept}
            isLoading={loading}
          >
            I Accept
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
