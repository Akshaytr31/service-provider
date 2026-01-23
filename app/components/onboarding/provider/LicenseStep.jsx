import { useState } from "react";
import {
  Stack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Box,
  Button,
  Text,
  useToast,
  Spinner,
} from "@chakra-ui/react";

export default function LicenseStep({ formData, handleChange, setFormData }) {
  const [uploading, setUploading] = useState(false);
  const toast = useToast();

  const handleFileUpload = async (file) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/provider/onboarding/license-upload", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Upload failed");
      }

      // Save secure reference (NOT URL)
      setFormData((prev) => ({
        ...prev,
        licenseDocument: {
          provider: "cloudinary",
          publicId: data.publicId,
          format: data.format,
          resourceType: data.resourceType,
        },
      }));

      toast({
        title: "Upload Successful",
        description: "License document has been uploaded.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error("Upload handler error:", err);
      toast({
        title: "Upload Failed",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Stack spacing={4} width="full" position="relative">
      <Heading
        size="sm"
        position="absolute"
        top="-35px"
        zIndex="1"
        bg="white"
        p="5px"
        color="gray.600"
      >
        License
      </Heading>

      <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap="20px">
        <FormControl isRequired>
          <FormLabel fontSize="sm" fontWeight="bold">
            License Name
          </FormLabel>
          <Input
            name="licenseName"
            value={formData.licenseName}
            onChange={handleChange}
            placeholder="License Name"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel fontSize="sm" fontWeight="bold">
            Issuing Authority
          </FormLabel>
          <Input
            name="licenseAuth"
            value={formData.licenseAuth}
            onChange={handleChange}
            placeholder="Issuing Authority"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel fontSize="sm" fontWeight="bold">
            License Number
          </FormLabel>
          <Input
            name="licenseNumber"
            value={formData.licenseNumber}
            onChange={handleChange}
            placeholder="License Number"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel fontSize="sm" fontWeight="bold">
            License Expiry Date
          </FormLabel>
          <Input
            name="licenseExpiry"
            type="date"
            value={formData.licenseExpiry}
            onChange={handleChange}
          />
        </FormControl>

        {/* ✅ Upload field (FULL WIDTH) */}
        <FormControl isRequired>
          <FormLabel fontSize="sm" fontWeight="bold">
            Upload License Document (PDF / JPG / PNG)
          </FormLabel>
          <Box position="relative">
            <Input
              alignContent={"center"}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              isDisabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
            {uploading && (
              <Spinner
                size="sm"
                position="absolute"
                right="10px"
                top="10px"
                color="blue.500"
              />
            )}
          </Box>
          {formData.licenseDocument && !uploading && (
            <Text fontSize="xs" color="green.600" mt={1}>
              Document uploaded successfully
            </Text>
          )}
        </FormControl>
      </Box>
    </Stack>
  );
}
