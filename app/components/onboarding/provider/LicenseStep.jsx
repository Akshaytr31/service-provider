import { useState, useEffect } from "react";
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
  IconButton,
  Divider,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";

export default function LicenseStep({ formData, handleChange, setFormData }) {
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const toast = useToast();

  // Initialize with one empty license if none exists
  useEffect(() => {
    if (!formData.licenses || formData.licenses.length === 0) {
      setFormData((prev) => ({
        ...prev,
        licenses: [
          {
            name: "",
            authority: "",
            number: "",
            expiry: "",
            document: null,
          },
        ],
      }));
    }
  }, [formData.licenses, setFormData]);

  const addLicense = () => {
    setFormData((prev) => ({
      ...prev,
      licenses: [
        ...(prev.licenses || []),
        {
          name: "",
          authority: "",
          number: "",
          expiry: "",
          document: null,
        },
      ],
    }));
  };

  const removeLicense = (index) => {
    setFormData((prev) => ({
      ...prev,
      licenses: prev.licenses.filter((_, i) => i !== index),
    }));
  };

  const handleLicenseChange = (index, field, value) => {
    setFormData((prev) => {
      const newLicenses = [...(prev.licenses || [])];
      newLicenses[index] = { ...newLicenses[index], [field]: value };
      return { ...prev, licenses: newLicenses };
    });
  };

  const handleFileUpload = async (index, file) => {
    setUploadingIndex(index);
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
      setFormData((prev) => {
        const newLicenses = [...(prev.licenses || [])];
        newLicenses[index] = {
          ...newLicenses[index],
          document: {
            provider: "cloudinary",
            publicId: data.publicId,
            format: data.format,
            resourceType: data.resourceType,
            version: data.version,
            secureUrl: data.secureUrl,
          },
        };
        return { ...prev, licenses: newLicenses };
      });

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
      setUploadingIndex(null);
    }
  };

  return (
    <Stack spacing={8} width="full" position="relative">
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
        Licenses
      </Heading>

      {(formData.licenses || []).map((license, index) => (
        <Box key={index} position="relative" pt={index > 0 ? 4 : 0}>
          {index > 0 && <Divider mb={8} />}
          <Stack spacing={6}>
            <Box display="flex" justifyContent="space-between" align="center">
              <Text fontWeight="bold" color="gray.600" fontSize="sm">
                License #{index + 1}
              </Text>
              {index > 0 && (
                <IconButton
                  size="xs"
                  colorScheme="red"
                  variant="ghost"
                  icon={<DeleteIcon />}
                  onClick={() => removeLicense(index)}
                  aria-label="Remove License"
                />
              )}
            </Box>

            <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={6}>
              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
                  License Name
                </FormLabel>
                <Input
                  size="sm"
                  borderRadius="lg"
                  focusBorderColor="green.400"
                  value={license.name}
                  onChange={(e) =>
                    handleLicenseChange(index, "name", e.target.value)
                  }
                  placeholder="e.g. Master Electrician License"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
                  Issuing Authority
                </FormLabel>
                <Input
                  size="sm"
                  borderRadius="lg"
                  focusBorderColor="green.400"
                  value={license.authority}
                  onChange={(e) =>
                    handleLicenseChange(index, "authority", e.target.value)
                  }
                  placeholder="e.g. City Council"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
                  License Number
                </FormLabel>
                <Input
                  size="sm"
                  borderRadius="lg"
                  focusBorderColor="green.400"
                  value={license.number}
                  onChange={(e) =>
                    handleLicenseChange(
                      index,
                      "number",
                      e.target.value.replace(/\D/g, ""),
                    )
                  }
                  placeholder="License Number"
                  inputMode="numeric"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
                  License Expiry Date
                </FormLabel>
                <Input
                  type="date"
                  size="sm"
                  borderRadius="lg"
                  focusBorderColor="green.400"
                  value={license.expiry}
                  onChange={(e) =>
                    handleLicenseChange(index, "expiry", e.target.value)
                  }
                />
              </FormControl>

              <FormControl isRequired gridColumn="1 / -1">
                <FormLabel fontSize="sm" fontWeight="bold">
                  Upload License Document (PDF / JPG / PNG)
                </FormLabel>
                <Box position="relative">
                  <Input
                    alignContent={"center"}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    isDisabled={uploadingIndex !== null}
                    size="sm"
                    borderRadius="lg"
                    focusBorderColor="green.400"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(index, file);
                    }}
                  />
                  {uploadingIndex === index && (
                    <Spinner
                      size="sm"
                      position="absolute"
                      right="10px"
                      top="10px"
                      color="green.500"
                    />
                  )}
                </Box>
                {license.document && uploadingIndex !== index && (
                  <Text
                    fontSize="10px"
                    color="green.600"
                    mt={1}
                    fontWeight="bold"
                  >
                    ✓ Document uploaded successfully
                  </Text>
                )}
              </FormControl>
            </Box>
          </Stack>
        </Box>
      ))}

      <Button
        leftIcon={<AddIcon size="xs" />}
        colorScheme="green"
        variant="ghost"
        size="sm"
        onClick={addLicense}
        alignSelf="flex-start"
        _hover={{ bg: "green.50" }}
      >
        Add more license
      </Button>
    </Stack>
  );
}
