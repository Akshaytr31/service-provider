"use client";

import { Box, Text, Button, Flex, Icon, useDisclosure } from "@chakra-ui/react";
import { FiAlertCircle } from "react-icons/fi";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import PrivacyPolicyModal from "./PrivacyPolicyModal";

export default function PrivacyPolicyNotification() {
  const { data: session } = useSession();
  const [needsAcceptance, setNeedsAcceptance] = useState(false);
  // We can reuse the modal logic here or control it via prop
  // Ideally, we lift the state up, but for now simple polling/checking is okay.
  // Actually, let's make this component responsible for checking AND showing the notification bar.
  // The Modal component can be triggered from here.

  // Let's refactor: PrivacyPolicyModal handles the check. If it determines need, it sets a state.
  // BUT the user wants a notification BAR on top.

  // New Plan:
  // 1. Check status here.
  // 2. If pending, show Bar.
  // 3. Clicking "Review" on Bar opens Modal.

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [policyContent, setPolicyContent] = useState("");

  const checkPolicyStatus = async () => {
    try {
      const res = await fetch("/api/user/check-privacy-policy");
      const data = await res.json();
      if (data.needsAcceptance) {
        setNeedsAcceptance(true);
        setPolicyContent(data.content);
        // We DON'T auto-open modal anymore if we want just a notification bar first?
        // User asked: "show a notification on the top ... when click it open the modal"
        // So we default to closed modal, open bar.
        // But previously it was auto-open. The prompt implies REPLACING auto-open with notification bar?
        // Or BOTH? "i need a close button too in the modal and show a notifucation on the top"
        // It implies the modal IS opening, but can be closed. If closed, the notification remains?
        // Let's implement: Auto-open ONCE (maybe), OR just Bar.
        // Let's stick to: Check > Show Bar > User clicks > Open Modal.
        // To be less intrusive, maybe just show Bar.

        // Wait, "close button too in the modal" -> implies modal is still used.
        // "show a notification ... when click it open the modal"

        // Let's auto-open the modal FIRST time? Or just show bar?
        // Let's do: Show Bar. If user hasn't seen it, maybe auto-open?
        // Simpler: Just Show Bar.
      } else {
        setNeedsAcceptance(false);
      }
    } catch (error) {
      console.error("Failed to check policy status:", error);
    }
  };

  useEffect(() => {
    if (session?.user) {
      checkPolicyStatus();
    }
  }, [session]);

  const handleAcceptSuccess = () => {
    setNeedsAcceptance(false);
    onClose();
  };

  if (!needsAcceptance) return null;

  return (
    <>
      <Box
        bg="red.600"
        color="white"
        px={4}
        py={2}
        width="100%"
        position="sticky"
        top={'70px'}
        zIndex={100}
      >
        <Flex justify="center" align="center" gap={4}>
          <Flex align="center" gap={2}>
            <Icon as={FiAlertCircle} />
            <Text fontSize="sm" fontWeight="medium">
              We have updated our Privacy Policy. Please review and accept to
              continue.
            </Text>
          </Flex>
          <Button size="xs" colorScheme="whiteAlpha" onClick={onOpen}>
            Review Now
          </Button>
        </Flex>
      </Box>

      {/* Render Modal controlled by this component */}
      <PrivacyPolicyModal
        isOpen={isOpen}
        onClose={onClose}
        policyContent={policyContent}
        onAcceptSuccess={handleAcceptSuccess}
      />
    </>
  );
}
