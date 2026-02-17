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
  Select,
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
  const [cancellationReason, setCancellationReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async () => {
    // Only check for rating if NOT cancelling
    if (!booking?.isCancelling && rating === 0) {
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

      // If cancelling, update status to CANCELLED
      if (booking?.isCancelling) {
        const cancelRes = await fetch(`/api/bookings/${booking.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "CANCELLED",
            cancellationReason:
              cancellationReason === "Other" ? comment : cancellationReason,
          }),
        });

        if (!cancelRes.ok) {
          throw new Error("Failed to cancel booking");
        }

        toast({
          title: "Booking Cancelled",
          status: "success",
          duration: 3000,
        });
        onReviewSubmitted();
        onClose();
        return; // Exit here if cancelling
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
        let title = "Review submitted";
        if (booking?.isCompleting) title = "Service Completed & Reviewed";

        toast({
          title,
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
        <ModalHeader>
          {booking?.isCancelling ? "Cancel Booking" : "Rate Your Experience"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6}>
            <Text color="gray.600" textAlign="center">
              {booking?.isCancelling
                ? "Please tell us why you are cancelling. Your feedback helps us improve."
                : `How was your service with `}
              {!booking?.isCancelling && <b>{booking?.service?.title}</b>}
            </Text>

            {booking?.isCancelling ? (
              <>
                <Select
                  placeholder="Select a reason"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  borderRadius="xl"
                  focusBorderColor="green.500"
                >
                  <option value="Change of plans">Change of plans</option>
                  <option value="Found another provider">
                    Found another provider
                  </option>
                  <option value="Service no longer needed">
                    Service no longer needed
                  </option>
                  <option value="Booking mistake">Booking mistake</option>
                  <option value="Other">Other</option>
                </Select>

                {cancellationReason === "Other" && (
                  <Textarea
                    placeholder="Please specify your reason..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    minH="100px"
                    borderRadius="xl"
                    focusBorderColor="green.500"
                  />
                )}
              </>
            ) : (
              <>
                <HStack spacing={2} justify="center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Icon
                      key={star}
                      as={StarIcon}
                      boxSize={8}
                      color={
                        (hoverRating || rating) >= star
                          ? "yellow.400"
                          : "gray.200"
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
                    ? ["Poor", "Fair", "Good", "Very Good", "Excellent"][
                        rating - 1
                      ]
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
              </>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} borderRadius="xl">
            Cancel
          </Button>
          <Button
            colorScheme={booking?.isCancelling ? "red" : "green"}
            onClick={handleSubmit}
            isLoading={isSubmitting}
            borderRadius="xl"
            isDisabled={
              booking?.isCancelling
                ? !cancellationReason ||
                  (cancellationReason === "Other" && !comment.trim())
                : rating === 0
            }
          >
            {booking?.isCancelling ? "Cancel Booking" : "Submit Review"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
