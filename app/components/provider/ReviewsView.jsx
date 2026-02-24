import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Avatar,
  Icon,
  Spinner,
  Flex,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Button,
} from "@chakra-ui/react";
import { useState, useEffect, useMemo } from "react";
import { FiStar, FiArrowLeft, FiCalendar } from "react-icons/fi";
import { useSearch } from "@/app/context/SearchContext";

export default function ReviewsView({ onBack }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { searchQuery } = useSearch();

  const filteredReviews = useMemo(() => {
    if (!searchQuery.trim()) return reviews;
    const q = searchQuery.toLowerCase();
    return reviews.filter((r) => {
      const seeker = r.booking?.seeker;
      // Match name, seekerProfile first/last name, service title, or comment
      const seekerName = (
        seeker?.name ||
        `${seeker?.seekerProfile?.firstName || ""} ${seeker?.seekerProfile?.lastName || ""}`.trim()
      ).toLowerCase();
      return (
        seekerName.includes(q) ||
        r.booking?.service?.title?.toLowerCase().includes(q) ||
        r.comment?.toLowerCase().includes(q)
      );
    });
  }, [reviews, searchQuery]);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch("/api/provider/reviews");
        if (res.ok) {
          const data = await res.json();
          setReviews(data);
        } else {
          console.error("Failed to fetch reviews");
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, []);

  if (loading) {
    return (
      <Flex justify="center" align="center" h="50vh">
        <Spinner size="xl" color="green.500" />
      </Flex>
    );
  }

  return (
    <Box>
      <Button
        leftIcon={<FiArrowLeft />}
        variant="ghost"
        mb={6}
        onClick={onBack}
      >
        Back to Dashboard
      </Button>

      <Heading size="lg" mb={6} color="gray.700">
        My Reviews
      </Heading>

      {filteredReviews.length === 0 ? (
        <Flex
          direction="column"
          align="center"
          justify="center"
          p={10}
          bg="white"
          borderRadius="xl"
          border="1px dashed"
          borderColor="gray.300"
        >
          <Icon as={FiStar} boxSize={10} color="gray.300" mb={4} />
          <Text color="gray.500" fontSize="lg">
            {searchQuery.trim()
              ? "No matching reviews found."
              : "No reviews yet."}
          </Text>
          {!searchQuery.trim() && (
            <Text color="gray.400" fontSize="sm">
              Complete jobs to get rated by seekers!
            </Text>
          )}
        </Flex>
      ) : (
        <VStack spacing={4} align="stretch">
          {filteredReviews.map((review) => (
            <Card key={review.id} borderRadius="xl" boxShadow="sm">
              <CardBody>
                <Flex gap={4} direction={{ base: "column", sm: "row" }}>
                  <Avatar
                    src={review.booking?.seeker?.image}
                    name={review.booking?.seeker?.name}
                    size="md"
                  />
                  <Box flex="1">
                    <Flex justify="space-between" align="flex-start" mb={2}>
                      <Box>
                        <Heading size="sm" mb={1}>
                          {review.booking?.seeker?.name ||
                            `${review.booking?.seeker?.seekerProfile?.firstName || ""} ${review.booking?.seeker?.seekerProfile?.lastName || ""}`.trim() ||
                            "Anonymous User"}
                        </Heading>
                        <HStack fontSize="xs" color="gray.500" spacing={3}>
                          <Text fontWeight="medium" color="green.600">
                            {review.booking?.service?.title}
                          </Text>
                          <Text>•</Text>
                          <HStack spacing={1}>
                            <Icon as={FiCalendar} />
                            <Text>
                              {new Date(review.createdAt).toLocaleDateString()}
                            </Text>
                          </HStack>
                        </HStack>
                      </Box>
                      <HStack spacing={1}>
                        {[...Array(5)].map((_, i) => (
                          <Icon
                            key={i}
                            as={FiStar}
                            color={
                              i < review.rating ? "orange.400" : "gray.200"
                            }
                            fill={i < review.rating ? "currentColor" : "none"}
                            boxSize={4}
                          />
                        ))}
                      </HStack>
                    </Flex>

                    {review.comment && (
                      <Text color="gray.600" mt={2} fontSize="sm">
                        "{review.comment}"
                      </Text>
                    )}
                  </Box>
                </Flex>
              </CardBody>
            </Card>
          ))}
        </VStack>
      )}
    </Box>
  );
}
