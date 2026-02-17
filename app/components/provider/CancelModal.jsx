import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Textarea,
  VStack,
  Text,
  Select,
  useToast,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { useState } from "react";

export default function CancelModal({ isOpen, onClose, booking, onCancel }) {
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async () => {
    if (!reason) {
      toast({
        title: "Reason required",
        description: "Please select a reason for cancellation.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    if (reason === "Other" && !customReason.trim()) {
      toast({
        title: "Details required",
        description: "Please provide details for 'Other' reason.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    const finalReason = reason === "Other" ? customReason : reason;

    setIsSubmitting(true);
    try {
      await onCancel(booking.id, "CANCELLED", finalReason);
      onClose();
      setReason("");
      setCustomReason("");
    } catch (error) {
      // Error handled in parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.300" />
      <ModalContent borderRadius="2xl">
        <ModalHeader>Cancel Booking</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Text color="gray.600">
              Are you sure you want to cancel the booking for{" "}
              <b>{booking?.service?.title}</b>?
            </Text>

            <FormControl>
              <FormLabel>Reason for Cancellation</FormLabel>
              <Select
                placeholder="Select reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                borderRadius="xl"
              >
                <option value="Schedule Conflict">Schedule Conflict</option>
                <option value="Personal Emergency">Personal Emergency</option>
                <option value="Unable to Perform Service">
                  Unable to Perform Service
                </option>
                <option value="Other">Other</option>
              </Select>
            </FormControl>

            {reason === "Other" && (
              <FormControl>
                <FormLabel>Please specify</FormLabel>
                <Textarea
                  placeholder="Enter details..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  borderRadius="xl"
                  rows={3}
                />
              </FormControl>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} borderRadius="xl">
            Keep Booking
          </Button>
          <Button
            colorScheme="red"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            borderRadius="xl"
          >
            Confirm Cancellation
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
