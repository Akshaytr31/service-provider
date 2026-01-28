"use client";

import {
  Box,
  Button,
  Input,
  Textarea,
  Stack,
  Heading,
  Select,
  FormControl,
  FormLabel,
  Image,
  Text,
  Spinner,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";

export default function PostService() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    price: "",
    subCategoryId: "",
    coverPhoto: "",
  });

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [availableSubCategories, setAvailableSubCategories] = useState([]);
  const [serviceRadius, setServiceRadius] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch categories and provider request in parallel
        const [categoriesRes, providerRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/provider/current-request"),
        ]);

        const allCategories = await categoriesRes.json();

        if (providerRes.ok) {
          const providerRequest = await providerRes.json();

          if (providerRequest.categoryId && providerRequest.subCategoryId) {
            // Filter Category
            const filteredCategory = allCategories.find(
              (c) => c.id === providerRequest.categoryId,
            );

            if (filteredCategory) {
              // Filter Subcategory
              const filteredSubCategories =
                filteredCategory.subCategories.filter(
                  (sub) => sub.id === providerRequest.subCategoryId,
                );

              // Update category with filtered subcategories
              const finalCategory = {
                ...filteredCategory,
                subCategories: filteredSubCategories,
              };

              setCategories([finalCategory]);
              setSelectedCategory(filteredCategory.id.toString());
              setAvailableSubCategories(filteredSubCategories);
              setForm((prev) => ({
                ...prev,
                subCategoryId: providerRequest.subCategoryId.toString(),
              }));
            }
          } else {
            // Fallback if no specific category in request (though unlikely for approved provider)
            setCategories(allCategories);
          }

          if (providerRequest.serviceRadius) {
            setServiceRadius(providerRequest.serviceRadius);
          }
        } else {
          // Fallback if provider request fetch fails
          setCategories(allCategories);
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Update available subcategories if selectedCategory changes (mostly for manual change if logic allows)
  useEffect(() => {
    if (selectedCategory && categories.length > 0) {
      const category = categories.find(
        (c) => c.id === parseInt(selectedCategory),
      );
      // If we already filtered the subcategories in the initial fetch, use those.
      // Otherwise (fallback case), use all subcategories of the category with matching ID.
      if (category) {
        setAvailableSubCategories(category.subCategories);
      }
    }
  }, [selectedCategory, categories]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/services/upload-cover", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (res.ok) {
        setForm((prev) => ({ ...prev, coverPhoto: data.secureUrl }));
      } else {
        alert("Image upload failed");
      }
    } catch (error) {
      console.error("Upload error", error);
      alert("Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.subCategoryId) {
      alert("Please select a subcategory");
      return;
    }

    const res = await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      alert("Service published successfully");
      setForm({
        title: "",
        description: "",
        location: "",
        price: "",
        subCategoryId: form.subCategoryId, // Keep the fixed subcategory
        coverPhoto: "",
      });
      // Don't reset selectedCategory as it's fixed
    } else {
      alert("Failed to publish service");
    }
  };

  if (loading) {
    return <Box>Loading...</Box>;
  }

  return (
    <Box maxW="600px" mx="auto" mt={10}>
      <Heading mb={6}>Provide Services</Heading>

      <Stack spacing={4}>
        <FormControl>
          <FormLabel>Category</FormLabel>
          <Select
            placeholder="Select Category"
            value={selectedCategory}
            isDisabled={true} // Lock selection
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              // setForm({ ...form, subCategoryId: "" }); // Don't reset if it's predetermined
            }}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl isDisabled={!selectedCategory}>
          <FormLabel>Sub Category</FormLabel>
          <Select
            placeholder="Select Sub Category"
            name="subCategoryId"
            value={form.subCategoryId}
            isDisabled={true} // Lock selection
            onChange={handleChange}
          >
            {availableSubCategories.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Service Radius (km)</FormLabel>
          <Input
            value={serviceRadius || "N/A"}
            isReadOnly
            variant="filled"
            cursor="not-allowed"
          />
        </FormControl>

        <Input
          placeholder="Service Title (e.g. Electrician)"
          name="title"
          value={form.title}
          onChange={handleChange}
        />

        <Textarea
          placeholder="Service Description"
          name="description"
          value={form.description}
          onChange={handleChange}
        />

        <Input
          placeholder="Location"
          name="location"
          value={form.location}
          onChange={handleChange}
        />

        <Input
          placeholder="Price / Rate"
          name="price"
          value={form.price}
          onChange={handleChange}
        />

        <FormControl>
          <FormLabel>Cover Photo</FormLabel>
          <Box position="relative">
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              p={1}
              isDisabled={uploading}
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
          {form.coverPhoto && (
            <Box mt={2}>
              <Text fontSize="sm" color="green.500" mb={1}>
                Cover photo uploaded:
              </Text>
              <Image
                src={form.coverPhoto}
                alt="Cover Preview"
                boxSize="100px"
                objectFit="cover"
                borderRadius="md"
              />
            </Box>
          )}
        </FormControl>

        <Button
          colorScheme="blue"
          onClick={handleSubmit}
          isDisabled={uploading}
          isLoading={uploading}
        >
          Publish Service
        </Button>
      </Stack>
    </Box>
  );
}
