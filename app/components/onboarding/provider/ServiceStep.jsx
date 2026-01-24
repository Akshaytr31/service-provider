import {
  Stack,
  Heading,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  Input,
  Box,
} from "@chakra-ui/react";

export default function ServiceStep({
  formData,
  handleChange,
  setFormData,
  categories,
  subCategories,
}) {
  return (
    <Stack spacing={6} width={"full"} position="relative">
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

      {/* CATEGORY */}
      <Box
        width={"full"}
        display={"grid"}
        gridTemplateColumns={"repeat(2, 1fr)"}
        gap={6}
      >
        <FormControl isRequired width={"full"}>
          <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
            Category
          </FormLabel>
          <Select
            name="categoryId"
            size="sm"
            borderRadius="lg"
            focusBorderColor="green.400"
            value={formData.categoryId}
            onChange={(e) => {
              handleChange(e);
              setFormData((prev) => ({
                ...prev,
                subCategoryId: "",
              }));
            }}
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
        <FormControl isRequired isDisabled={!formData.categoryId}>
          <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
            Sub Category
          </FormLabel>
          <Select
            name="subCategoryId"
            size="sm"
            borderRadius="lg"
            focusBorderColor="green.400"
            value={formData.subCategoryId}
            onChange={handleChange}
          >
            <option value="" disabled>
              {formData.categoryId
                ? "Select Sub Category"
                : "Select Category first"}
            </option>

            {subCategories.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </FormControl>

        {/* SERVICES OFFERED */}
        <FormControl>
          <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
            Services Offered
          </FormLabel>
          <Textarea
            name="servicesOfferedInput"
            placeholder="e.g. Electrical, Plumbing, HVAC (comma separated)"
            size="sm"
            borderRadius="lg"
            focusBorderColor="green.400"
            value={formData.servicesOfferedInput}
            onChange={handleChange}
            rows={3}
          />
        </FormControl>

        {/* DESCRIPTION */}
        <FormControl isRequired>
          <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
            Service Description
          </FormLabel>
          <Textarea
            name="description"
            placeholder="Briefly describe your expertise"
            size="sm"
            borderRadius="lg"
            focusBorderColor="green.400"
            value={formData.description}
            onChange={handleChange}
            rows={3}
          />
        </FormControl>

        {/* EXPERIENCE */}
        <FormControl isRequired>
          <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
            Years of Experience
          </FormLabel>
          <Input
            name="yearsExperience"
            placeholder="e.g. 5"
            size="sm"
            borderRadius="lg"
            focusBorderColor="green.400"
            value={formData.yearsExperience}
            onChange={handleChange}
            inputMode="numeric"
            pattern="[0-9]*"
          />
        </FormControl>
      </Box>
    </Stack>
  );
}
