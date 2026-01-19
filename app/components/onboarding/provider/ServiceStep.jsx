import {
  Stack,
  Heading,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  Input,
  Box
} from "@chakra-ui/react";

export default function ServiceStep({
  formData,
  handleChange,
  setFormData,
  categories,
  subCategories,
}) {
  return (
    <Stack spacing={4} width={"full"} >
      <Heading size="sm">Service Details</Heading>

      {/* CATEGORY */}
      <Box width={"full"} display={"grid"} gridTemplateColumns={"repeat(2, 1fr)"} gap={'10px'}>

      <FormControl isRequired width={"full"}>
        <FormLabel fontSize="sm">Category</FormLabel>
        <Select
          name="categoryId"
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
        <FormLabel fontSize="sm">Sub Category</FormLabel>
        <Select
          name="subCategoryId"
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
        <FormLabel fontSize="sm">Services Offered</FormLabel>
        <Textarea
          name="servicesOfferedInput"
          placeholder="Services Offered (comma separated)"
          value={formData.servicesOfferedInput}
          onChange={handleChange}
        />
      </FormControl>

      {/* DESCRIPTION */}
      <FormControl isRequired>
        <FormLabel fontSize="sm">Service Description</FormLabel>
        <Textarea
          name="description"
          placeholder="Describe your service"
          value={formData.description}
          onChange={handleChange}
        />
      </FormControl>

      {/* EXPERIENCE */}
      <FormControl isRequired>
        <FormLabel fontSize="sm">Years of Experience</FormLabel>
        <Input
          name="yearsExperience"
          placeholder="Years of Experience"
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
