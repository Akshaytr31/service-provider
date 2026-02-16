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

  /* ================= TOGGLE STATE ================= */
  const [activeView, setActiveView] = useState("category"); // 'category' | 'subcategory'

  return (
    <Box maxW="800px" mx="auto">
      <VStack spacing={{ base: 4, md: 5 }} align="stretch">
        <Flex direction="column" align="center" textAlign="center">
          <Heading
            size={{ base: "lg", md: "xl" }}
            mb={2}
            color="green.700"
            letterSpacing="tight"
          >
            Manage Categories
          </Heading>
          <Text color="gray.500" fontSize={{ base: "md", md: "lg" }}>
            Organize your services efficiently
          </Text>
        </Flex>

        <Flex justify="center" w="full">
          <HStack
            spacing={{ base: 1, md: 2 }}
            bg="white"
            p={1.5}
            borderRadius="full"
            boxShadow="md"
            border="1px solid"
            borderColor="green.100"
            w={{ base: "full", sm: "auto" }}
          >
            <Button
              onClick={() => setActiveView("category")}
              variant={activeView === "category" ? "solid" : "ghost"}
              colorScheme="green"
              borderRadius="full"
              px={{ base: 4, md: 8 }}
              size={{ base: "sm", md: "md" }}
              flex={{ base: 1, sm: "auto" }}
              _hover={{
                transform: activeView === "category" ? "none" : "scale(1.05)",
              }}
              transition="all 0.2s"
            >
              Add Category
            </Button>
            <Button
              onClick={() => setActiveView("subcategory")}
              variant={activeView === "subcategory" ? "solid" : "ghost"}
              colorScheme="green"
              borderRadius="full"
              px={{ base: 4, md: 8 }}
              size={{ base: "sm", md: "md" }}
              flex={{ base: 1, sm: "auto" }}
              _hover={{
                transform:
                  activeView === "subcategory" ? "none" : "scale(1.05)",
              }}
              transition="all 0.2s"
            >
              Add Sub-Category
            </Button>
          </HStack>
        </Flex>

        <Box minH="400px">
          {activeView === "category" ? (
            <Card
              variant="outline"
              boxShadow="xl"
              borderRadius="2xl"
              overflow="hidden"
              borderColor="green.200"
              bg="white"
            >
              <CardHeader
                bg="green.50"
                py={6}
                borderBottom="1px solid"
                borderBottomColor="green.100"
              >
                <HStack justify="space-between" align="center">
                  <Box>
                    <Heading size="md" color="green.800">
                      Add Category
                    </Heading>
                    <Text fontSize="sm" color="green.600" mt={1}>
                      Create a new main service category
                    </Text>
                  </Box>
                  <Box
                    p={2}
                    bg="white"
                    borderRadius="lg"
                    color="green.500"
                    boxShadow="sm"
                  >
                    <AddIcon boxSize={5} />
                  </Box>
                </HStack>
              </CardHeader>

              <CardBody p={8}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    addCategory();
                  }}
                  style={{ width: "100%" }}
                >
                  <VStack spacing={6}>
                    <Input
                      placeholder="Category name *"
                      size="lg"
                      borderRadius="xl"
                      focusBorderColor="green.500"
                      borderColor="green.200"
                      _hover={{ borderColor: "green.300" }}
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
                      size="lg"
                      borderRadius="xl"
                      focusBorderColor="green.500"
                      borderColor="green.200"
                      _hover={{ borderColor: "green.300" }}
                      value={categoryForm.image}
                      onChange={(e) =>
                        setCategoryForm({
                          ...categoryForm,
                          image: e.target.value,
                        })
                      }
                    />

                    <Button
                      colorScheme="green"
                      size="lg"
                      w="full"
                      borderRadius="xl"
                      mt={4}
                      leftIcon={<AddIcon />}
                      type="submit"
                      boxShadow="lg"
                      _hover={{
                        transform: "translateY(-2px)",
                        boxShadow: "xl",
                      }}
                      transition="all 0.2s"
                    >
                      Create Category
                    </Button>
                  </VStack>
                </form>
              </CardBody>
            </Card>
          ) : (
            <Card
              variant="outline"
              boxShadow="xl"
              borderRadius="2xl"
              overflow="hidden"
              borderColor="green.200"
              bg="white"
            >
              <CardHeader
                bg="green.50"
                py={6}
                borderBottom="1px solid"
                borderBottomColor="green.100"
              >
                <HStack justify="space-between" align="center">
                  <Box>
                    <Heading size="md" color="green.800">
                      Add Sub-Category
                    </Heading>
                    <Text fontSize="sm" color="green.600" mt={1}>
                      Assign a sub-category to an existing category
                    </Text>
                  </Box>
                  <Box
                    p={2}
                    bg="white"
                    borderRadius="lg"
                    color="green.500"
                    boxShadow="sm"
                  >
                    <AddIcon boxSize={5} />
                  </Box>
                </HStack>
              </CardHeader>

              <CardBody p={8}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    addSubCategory();
                  }}
                  style={{ width: "100%" }}
                >
                  <VStack spacing={6}>
                    <Input
                      placeholder="Sub-category name *"
                      size="lg"
                      borderRadius="xl"
                      focusBorderColor="green.500"
                      borderColor="green.200"
                      _hover={{ borderColor: "green.300" }}
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
                      size="lg"
                      borderRadius="xl"
                      focusBorderColor="green.500"
                      borderColor="green.200"
                      _hover={{ borderColor: "green.300" }}
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

                    <Button
                      colorScheme="green"
                      size="lg"
                      w="full"
                      borderRadius="xl"
                      mt={4}
                      leftIcon={<AddIcon />}
                      type="submit"
                      boxShadow="lg"
                      _hover={{
                        transform: "translateY(-2px)",
                        boxShadow: "xl",
                      }}
                      transition="all 0.2s"
                    >
                      Create Sub-Category
                    </Button>
                  </VStack>
                </form>
              </CardBody>
            </Card>
          )}
        </Box>
      </VStack>
    </Box>
  );
}
