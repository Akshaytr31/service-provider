"use client";

import {
  Box,
  Button,
  Heading,
  Input,
  Select,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

export default function CategoryManager() {
  const toast = useToast();

  const [categories, setCategories] = useState([]);

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    image: "",
  });

  const [subCategoryForm, setSubCategoryForm] = useState({
    name: "",
    categoryId: "",
  });

  /* Fetch categories */
  const fetchCategories = async () => {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /* Add category */
  const addCategory = async () => {
    if (!categoryForm.name) {
      toast({
        title: "Category name required",
        status: "warning",
      });
      return;
    }

    await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(categoryForm),
    });

    setCategoryForm({ name: "", image: "" });
    fetchCategories();

    toast({
      title: "Category added",
      status: "success",
    });
  };

  /* Add sub-category */
  const addSubCategory = async () => {
    if (!subCategoryForm.name || !subCategoryForm.categoryId) {
      toast({
        title: "All fields required",
        status: "warning",
      });
      return;
    }

    await fetch("/api/admin/sub-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subCategoryForm),
    });

    setSubCategoryForm({ name: "", categoryId: "" });

    toast({
      title: "Sub-category added",
      status: "success",
    });
  };

  return (
    <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
      {/* CATEGORY */}
      <Heading size="md" mb={3}>
        Add Category
      </Heading>

      <VStack spacing={3} mb={6}>
        <Input
          placeholder="Category name"
          value={categoryForm.name}
          onChange={(e) =>
            setCategoryForm({
              ...categoryForm,
              name: e.target.value,
            })
          }
        />

        <Input
          placeholder="Image URL (optional)"
          value={categoryForm.image}
          onChange={(e) =>
            setCategoryForm({
              ...categoryForm,
              image: e.target.value,
            })
          }
        />

        <Button colorScheme="blue" onClick={addCategory}>
          Add Category
        </Button>
      </VStack>

      {/* SUB CATEGORY */}
      <Heading size="md" mb={3}>
        Add Sub-Category
      </Heading>

      <VStack spacing={3}>
        <Input
          placeholder="Sub-category name"
          value={subCategoryForm.name}
          onChange={(e) =>
            setSubCategoryForm({
              ...subCategoryForm,
              name: e.target.value,
            })
          }
        />

        <Select
          placeholder="Select category"
          value={subCategoryForm.categoryId}
          onChange={(e) =>
            setSubCategoryForm({
              ...subCategoryForm,
              categoryId: e.target.value,
            })
          }
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </Select>

        <Button colorScheme="green" onClick={addSubCategory}>
          Add Sub-Category
        </Button>
      </VStack>
    </Box>
  );
}
