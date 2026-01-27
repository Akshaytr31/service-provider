import {
  Stack,
  Heading,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  Input,
  Box,
  Button,
  IconButton,
  Divider,
  Text,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { useEffect } from "react";

export default function ServiceStep({
  formData,
  handleChange,
  setFormData,
  categories,
}) {
  // Initialize with one empty service if none exists
  useEffect(() => {
    if (!formData.services || formData.services.length === 0) {
      setFormData((prev) => ({
        ...prev,
        services: [
          {
            categoryId: "",
            subCategoryId: "",
            description: "",
            yearsExperience: "",
            extraSkills: [],
            extraSkillsInput: "",
          },
        ],
      }));
    }
  }, [formData.services, setFormData]);

  const addService = () => {
    setFormData((prev) => ({
      ...prev,
      services: [
        ...(prev.services || []),
        {
          categoryId: "",
          subCategoryId: "",
          description: "",
          yearsExperience: "",
          extraSkills: [],
          extraSkillsInput: "",
        },
      ],
    }));
  };

  const removeService = (index) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index),
    }));
  };

  const handleServiceChange = (index, field, value) => {
    setFormData((prev) => {
      const newServices = [...(prev.services || [])];

      let finalValue = value;
      if (field === "yearsExperience") {
        finalValue = value.replace(/\D/g, "");
      }

      // If category changes, reset subcategory
      if (field === "categoryId") {
        newServices[index] = {
          ...newServices[index],
          [field]: finalValue,
          subCategoryId: "",
        };
      } else {
        newServices[index] = { ...newServices[index], [field]: finalValue };
      }
      return { ...prev, services: newServices };
    });
  };

  const handleAddTag = (index, e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const currentService = formData.services[index];
      const value = (currentService.extraSkillsInput || "")
        .trim()
        .replace(",", "");

      if (!value) return;
      if ((currentService.extraSkills || []).includes(value)) return;

      setFormData((prev) => {
        const newServices = [...(prev.services || [])];
        newServices[index] = {
          ...newServices[index],
          extraSkills: [...(newServices[index].extraSkills || []), value],
          extraSkillsInput: "",
        };
        return { ...prev, services: newServices };
      });
    }
  };

  const removeTag = (serviceIndex, tagIndex) => {
    setFormData((prev) => {
      const newServices = [...(prev.services || [])];
      newServices[serviceIndex] = {
        ...newServices[serviceIndex],
        extraSkills: newServices[serviceIndex].extraSkills.filter(
          (_, i) => i !== tagIndex,
        ),
      };
      return { ...prev, services: newServices };
    });
  };

  return (
    <Stack spacing={8} width={"full"} position="relative">
      <Heading
        size="xs"
        position="absolute"
        top="-45px"
        left="0"
        zIndex="1"
        bg="white"
        px={2}
        color={"green.600"}
        textTransform="uppercase"
        letterSpacing="wider"
        fontWeight="bold"
      >
        Service Details
      </Heading>

      {(formData.services || []).map((service, index) => {
        // Find subcategories for the selected category in this specific service entry
        const selectedCategory = categories.find(
          (c) => c.id === Number(service.categoryId),
        );
        const entrySubCategories = selectedCategory?.subCategories || [];

        return (
          <Box key={index} position="relative" pt={index > 0 ? 4 : 0}>
            {index > 0 && <Divider mb={8} />}
            <Stack spacing={6}>
              <Box display="flex" justifyContent="space-between" align="center">
                <Text fontWeight="bold" color="gray.600" fontSize="sm">
                  Service #{index + 1}
                </Text>
                {index > 0 && (
                  <IconButton
                    size="xs"
                    colorScheme="red"
                    variant="ghost"
                    icon={<DeleteIcon />}
                    onClick={() => removeService(index)}
                    aria-label="Remove Service"
                  />
                )}
              </Box>

              <Box
                display={"grid"}
                gridTemplateColumns={"repeat(2, 1fr)"}
                gap={6}
              >
                {/* CATEGORY */}
                <FormControl isRequired>
                  <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
                    Category
                  </FormLabel>
                  <Select
                    size="sm"
                    borderRadius="lg"
                    focusBorderColor="green.400"
                    value={service.categoryId}
                    onChange={(e) =>
                      handleServiceChange(index, "categoryId", e.target.value)
                    }
                  >
                    <option value="" disabled>
                      Select Category
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                {/* SUB CATEGORY */}
                <FormControl isRequired isDisabled={!service.categoryId}>
                  <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
                    Sub Category
                  </FormLabel>
                  <Select
                    size="sm"
                    borderRadius="lg"
                    focusBorderColor="green.400"
                    value={service.subCategoryId}
                    onChange={(e) =>
                      handleServiceChange(
                        index,
                        "subCategoryId",
                        e.target.value,
                      )
                    }
                  >
                    <option value="" disabled>
                      {service.categoryId
                        ? "Select Sub Category"
                        : "Select Category first"}
                    </option>
                    {entrySubCategories.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                {/* DESCRIPTION */}
                <FormControl isRequired gridColumn="1 / -1">
                  <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
                    Service Description
                  </FormLabel>
                  <Textarea
                    placeholder="Briefly describe your expertise for this service"
                    size="sm"
                    borderRadius="lg"
                    focusBorderColor="green.400"
                    value={service.description}
                    onChange={(e) =>
                      handleServiceChange(index, "description", e.target.value)
                    }
                    rows={3}
                  />
                </FormControl>
                {/* Comma-separated services offered (optional) - PER SERVICE */}
                <FormControl gridColumn="1 / -1">
                  <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
                    Additional Skills / Services
                  </FormLabel>

                  <Textarea
                    placeholder="Type a skill and press Enter (e.g. Electrical)"
                    size="sm"
                    borderRadius="lg"
                    focusBorderColor="green.400"
                    value={service.extraSkillsInput || ""}
                    rows={2}
                    onChange={(e) =>
                      handleServiceChange(
                        index,
                        "extraSkillsInput",
                        e.target.value,
                      )
                    }
                    onKeyDown={(e) => handleAddTag(index, e)}
                  />

                  {/* TAGS */}
                  <HStack mt={2} spacing={2} wrap="wrap">
                    {(service.extraSkills || []).map((skill, tagIndex) => (
                      <Tag
                        key={tagIndex}
                        size="sm"
                        borderRadius="full"
                        variant="subtle"
                        colorScheme="green"
                      >
                        <TagLabel>{skill}</TagLabel>
                        <TagCloseButton
                          onClick={() => removeTag(index, tagIndex)}
                        />
                      </Tag>
                    ))}
                  </HStack>
                </FormControl>

                {/* EXPERIENCE */}
                <Box>
                  <FormControl isRequired>
                    <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
                      Years of Experience (for this service)
                    </FormLabel>
                    <Input
                      placeholder="e.g. 5"
                      size="sm"
                      borderRadius="lg"
                      focusBorderColor="green.400"
                      value={service.yearsExperience || ""}
                      onChange={(e) =>
                        handleServiceChange(
                          index,
                          "yearsExperience",
                          e.target.value,
                        )
                      }
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                  </FormControl>
                </Box>
              </Box>
            </Stack>
          </Box>
        );
      })}

      <Box display="flex" gap={4} alignItems="center">
        <Button
          leftIcon={<AddIcon size="xs" />}
          colorScheme="green"
          variant="ghost"
          size="sm"
          onClick={addService}
          _hover={{ bg: "green.50" }}
        >
          Add more service
        </Button>
      </Box>
    </Stack>
  );
}
