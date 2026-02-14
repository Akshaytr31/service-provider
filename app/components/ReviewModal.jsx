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
  HStack,
  Text,
  Icon,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { StarIcon } from "@chakra-ui/icons";

export default function ReviewModal({
  isOpen,
  onClose,
  booking,
  onReviewSubmitted,
}) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a star rating.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // If completing, update status first
      if (booking?.isCompleting) {
        const completeRes = await fetch(`/api/bookings/${booking.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "COMPLETED" }),
        });

        if (!completeRes.ok) {
          throw new Error("Failed to mark booking as completed");
        }
      }

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          rating,
          comment,
        }),
      });

      if (res.ok) {
        toast({
          title: booking?.isCompleting
            ? "Service Completed & Reviewed"
            : "Review submitted",
          status: "success",
          duration: 3000,
        });
        onReviewSubmitted();
        onClose();
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit review");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.300" />
      <ModalContent borderRadius="2xl">
        <ModalHeader>Rate Your Experience</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6}>
            <Text color="gray.600" textAlign="center">
              How was your service with <b>{booking?.service?.title}</b>?
            </Text>

            {/* Star Rating */}
            <HStack spacing={2} justify="center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Icon
                  key={star}
                  as={StarIcon}
                  boxSize={8}
                  color={
                    (hoverRating || rating) >= star ? "yellow.400" : "gray.200"
                  }
                  cursor="pointer"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  transition="all 0.2s"
                  _hover={{ transform: "scale(1.1)" }}
                />
              ))}
            </HStack>
            <Text fontWeight="bold" color="yellow.500" h="20px">
              {rating > 0
                ? ["Poor", "Fair", "Good", "Very Good", "Excellent"][rating - 1]
                : ""}
            </Text>

            <Textarea
              placeholder="Share details of your own experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              minH="120px"
              borderRadius="xl"
              focusBorderColor="green.500"
            />
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} borderRadius="xl">
            Cancel
          </Button>
          <Button
            colorScheme="green"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            borderRadius="xl"
            isDisabled={rating === 0}
          >
            Submit Review
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
