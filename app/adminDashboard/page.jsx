"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
  Spinner,
  Badge,
  HStack,
  Card,
  CardBody,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import CategoryManager from "../components/admin/CategoryManager";

export default function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("requests"); // "categories" | "requests"
  const router = useRouter();

  const fetchRequests = async () => {
    const res = await fetch("/api/admin/provider-requests");
    const data = await res.json();
    setRequests(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (loading) {
    return (
      <Box p={6}>
        <Spinner />
      </Box>
    );
  }

  return (
    <Box p={6} maxW="1200px" mx="auto">
      {/* ================= HEADER ================= */}
      <Heading mb={6} color="gray.700">Admin Dashboard</Heading>

      {/* ================= ACTION BUTTONS ================= */}
      <HStack spacing={4} mb={8}>
        <Button
          colorScheme={activeView === "categories" ? "green" : "gray"}
          onClick={() => setActiveView("categories")}
        >
          Add Category
        </Button>

        <Button
          colorScheme={activeView === "requests" ? "green" : "gray"}
          onClick={() => setActiveView("requests")}
        >
          Provider Requests
        </Button>
      </HStack>

      {/* ================= CATEGORY MANAGER ================= */}
      {activeView === "categories" && (
        <Card>
          <CardBody>
            <Heading size="md" mb={4} color="gray.700">
              Manage Categories
            </Heading>
            <CategoryManager />
          </CardBody>
        </Card>
      )}

      {/* ================= PROVIDER REQUESTS ================= */}
      {activeView === "requests" && (
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>
              Provider Requests
            </Heading>

            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>

              <Tbody>
                {requests.map((req) => (
                  <Tr
                    key={req.id}
                    cursor="pointer"
                    _hover={{ bg: "gray.100" }}
                    onClick={() =>
                      router.push(`/admin/provider-requests/${req.id}`)
                    }
                  >
                    <Td>{req.businessName || req.user?.name || "N/A"}</Td>
                    <Td>{req.user?.email || "-"}</Td>
                    <Td>
                      <Badge
                        colorScheme={
                          req.status === "PENDING"
                            ? "yellow"
                            : req.status === "APPROVED"
                            ? "green"
                            : "red"
                        }
                      >
                        {req.status}
                      </Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      )}
    </Box>
  );
}
