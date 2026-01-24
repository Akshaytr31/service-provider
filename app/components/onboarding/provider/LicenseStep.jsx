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
        size="xs"
        position="absolute"
        top="-45px"
        left="0"
        zIndex="1"
        bg="white"
        px={2}
        color="green.600"
        textTransform="uppercase"
        letterSpacing="wider"
        fontWeight="bold"
      >
        License
      </Heading>

      <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={6}>
        <FormControl isRequired>
          <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
            License Name
          </FormLabel>
          <Input
            name="licenseName"
            size="sm"
            borderRadius="lg"
            focusBorderColor="green.400"
            value={formData.licenseName}
            onChange={handleChange}
            placeholder="e.g. Master Electrician License"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
            Issuing Authority
          </FormLabel>
          <Input
            name="licenseAuth"
            size="sm"
            borderRadius="lg"
            focusBorderColor="green.400"
            value={formData.licenseAuth}
            onChange={handleChange}
            placeholder="e.g. City Council"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
            License Number
          </FormLabel>
          <Input
            name="licenseNumber"
            size="sm"
            borderRadius="lg"
            focusBorderColor="green.400"
            value={formData.licenseNumber}
            onChange={handleChange}
            placeholder="License Number"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
            License Expiry Date
          </FormLabel>
          <Input
            name="licenseExpiry"
            type="date"
            size="sm"
            borderRadius="lg"
            focusBorderColor="green.400"
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
              size="sm"
              borderRadius="lg"

              focusBorderColor="green.400"
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
                color="green.500"
              />
            )}
          </Box>
          {formData.licenseDocument && !uploading && (
            <Text fontSize="10px" color="green.600" mt={1} fontWeight="bold">
              ✓ Document uploaded successfully
            </Text>
          )}
        </FormControl>
      </Box>
    </Stack>
  );
}
