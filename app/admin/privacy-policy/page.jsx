"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Heading,
  Textarea,
  Spinner,
  useToast,
  Card,
  CardBody,
} from "@chakra-ui/react";

export default function PrivacyPolicyAdminPage() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchPrivacyPolicy = async () => {
      try {
        const res = await fetch("/api/admin/privacyPolicy");
        const data = await res.json();

        if (data?.content) {
          setContent(data.content);
        }
      } catch (error) {
        console.error("Failed to fetch privacy policy:", error);
        toast({
          title: "Failed to load privacy policy",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPrivacyPolicy();
  }, [toast]);

  /* ================= SAVE PRIVACY POLICY ================= */
  const handleSave = async () => {
    try {
      setSaving(true);

      const res = await fetch("/api/admin/privacyPolicy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        throw new Error("Save failed");
      }

      toast({
        title: "Privacy Policy updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Failed to save privacy policy:", error);
      toast({
        title: "Failed to save privacy policy",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  /* ================= LOADING STATE ================= */
  if (loading) {
    return (
      <Box p={6} textAlign="center">
        <Spinner size="lg" />
      </Box>
    );
  }

  /* ================= UI ================= */
  return (
    <Box p={6} maxW="1000px" mx="auto" marginTop={"70px"}>
      <Card>
        <CardBody>
          <Heading size="lg" mb={4} color="gray.700">
            Privacy Policy
          </Heading>

          <Textarea backgroundColor="gray.700" color="gray.200"
            padding={"20px"}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={18}
            fontSize={"12px"}
            placeholder="Write or update the privacy policy here..."
            resize="vertical"
          />

          <Button
            mt={4}
            colorScheme="green"
            onClick={handleSave}
            isLoading={saving}
            loadingText="Saving"
          >
            Save Policy
          </Button>
        </CardBody>
      </Card>
    </Box>
  );
}
