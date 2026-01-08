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
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import CategoryManager from "../components/admin/CategoryManager";

export default function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
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
    <Box p={6}>
      <Heading mb={3}>Add category and sub category</Heading>
      <CategoryManager/>
      <Heading>Provider requests</Heading>
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
              _hover={{ bg: "gray.50" }}
              onClick={() =>
                router.push(`/admin/provider-requests/${req.id}`)
              }
            >
              <Td>{req.user.name || "N/A"}</Td>
              <Td>{req.user.email}</Td>
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
    </Box>
  );
}
