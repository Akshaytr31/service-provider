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
} from "@chakra-ui/react";
import { useState, useEffect } from "react";

export default function PostService() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    price: "",
    subCategoryId: "",
  });

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [availableSubCategories, setAvailableSubCategories] = useState([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const category = categories.find((c) => c.id === parseInt(selectedCategory));
      setAvailableSubCategories(category ? category.subCategories : []);
    } else {
      setAvailableSubCategories([]);
    }
  }, [selectedCategory, categories]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
        subCategoryId: "",
      });
      setSelectedCategory("");
    } else {
      alert("Failed to publish service");
    }
  };

  return (
    <Box maxW="600px" mx="auto" mt={10}>
      <Heading mb={6}>Provide Services</Heading>

      <Stack spacing={4}>
        <FormControl>
          <FormLabel>Category</FormLabel>
          <Select
            placeholder="Select Category"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setForm({ ...form, subCategoryId: "" });
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
            onChange={handleChange}
          >
            {availableSubCategories.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </Select>
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

        <Button colorScheme="blue" onClick={handleSubmit}>
          Publish Service
        </Button>
      </Stack>
    </Box>
  );
}
