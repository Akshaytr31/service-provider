"use client";

import {
  Box,
  Button,
  Heading,
  Input,
  Select,
  VStack,
  HStack,
  Text,
  useToast,
  Card,
  CardHeader,
  Divider,
  CardBody,
  Flex,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
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

  /* ================= FETCH CATEGORIES ================= */
  const fetchCategories = async () => {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /* ================= ADD CATEGORY ================= */
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
      title: "Category added successfully",
      status: "success",
    });
  };

  /* ================= ADD SUB-CATEGORY ================= */
  const addSubCategory = async () => {
    if (!subCategoryForm.name || !subCategoryForm.categoryId) {
      toast({
        title: "All fields are required",
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
      title: "Sub-category added successfully",
      status: "success",
    });
  };

  return (
    <Box >
      <Flex direction={{ base: "column", md: "row" }} gap={4} alignItems={"flex-start"}>
        {/* ================= CATEGORY CARD ================= */}

        <Card mb={6} boxShadow="md" flex="1">
          <CardHeader>
            <Heading size="md" color="gray.700">Add Category</Heading>
            <Text fontSize="sm" color="gray.500">
              Create a new main service category
            </Text>
          </CardHeader>

          <Divider />

          <CardBody>
            <VStack spacing={4}>
              <Input
                placeholder="Category name *"
                value={categoryForm.name}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, name: e.target.value })
                }
              />

              <Input
                placeholder="Image URL (optional)"
                value={categoryForm.image}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, image: e.target.value })
                }
              />

              <Button
                colorScheme="blue"
                leftIcon={<AddIcon />}
                alignSelf="flex-end"
                onClick={addCategory}
              >
                Add Category
              </Button>
            </VStack>
          </CardBody>
        </Card>

        {/* ================= SUB CATEGORY CARD ================= */}
        <Card boxShadow="md" flex="1">
          <CardHeader>
            <Heading size="md" color="gray.700">Add Sub-Category</Heading>
            <Text fontSize="sm" color="gray.500">
              Assign a sub-category to an existing category
            </Text>
          </CardHeader>

          <Divider />

          <CardBody>
            <VStack spacing={4}>
              <Input
                placeholder="Sub-category name *"
                value={subCategoryForm.name}
                onChange={(e) =>
                  setSubCategoryForm({
                    ...subCategoryForm,
                    name: e.target.value,
                  })
                }
              />

              <Select
                placeholder="Select parent category *"
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

              <HStack w="100%" justify="flex-end">
                <Button
                  colorScheme="green"
                  leftIcon={<AddIcon />}
                  onClick={addSubCategory}
                >
                  Add Sub-Category
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </Flex>
    </Box>
  );
}
