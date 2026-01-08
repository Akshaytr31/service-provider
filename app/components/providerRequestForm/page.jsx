"use client";

import {
  Box,
  Heading,
  Input,
  Textarea,
  Button,
  Stack,
  Avatar,
  FormControl,
  FormLabel,
  Card,
  CardBody,
  Divider,
  Flex,
} from "@chakra-ui/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProviderRequestForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    about: "",
    education: "",
    experience: "",
    skills: "",
    certificates: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        about: form.about,
        education: form.education,
        experience: form.experience,
        skills: form.skills.split(",").map((s) => s.trim()),
        certificates: form.certificates.split(",").map((c) => c.trim()),
        profilePhoto: "uploaded-image-url",
      };

      const res = await fetch("/api/provider/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      alert("Request sent successfully. Waiting for admin approval.");
      router.push("/");
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <Box p={6} maxW="900px" mx="auto">
      <Heading mb={6}>Provider Request Form</Heading>

      {/* Profile Photo */}
      <Card mb={6}>
        <CardBody>
          <Flex align="center" gap={4}>
            <Avatar size="xl" />
            <Button variant="outline">Upload Profile Photo</Button>
          </Flex>
        </CardBody>
      </Card>

      <Section title="About">
        <FormControl>
          <FormLabel>About</FormLabel>
          <Textarea
            name="about"
            placeholder="Describe yourself"
            onChange={handleChange}
          />
        </FormControl>
      </Section>

      <Section title="Skills">
        <FormControl>
          <FormLabel>Skills (comma separated)</FormLabel>
          <Input
            name="skills"
            placeholder="Wiring, AC Repair, Plumbing"
            onChange={handleChange}
          />
        </FormControl>
      </Section>

      <Section title="Education">
        <FormControl>
          <FormLabel>Education</FormLabel>
          <Textarea
            name="education"
            placeholder="Diploma / Degree / Institution"
            onChange={handleChange}
          />
        </FormControl>
      </Section>

      <Section title="Work Experience">
        <FormControl>
          <FormLabel>Experience</FormLabel>
          <Textarea
            name="experience"
            placeholder="Company, role, duration"
            onChange={handleChange}
          />
        </FormControl>
      </Section>

      <Section title="Certificates">
        <FormControl>
          <FormLabel>Certificates (comma separated)</FormLabel>
          <Input
            name="certificates"
            placeholder="Electrician License, Safety Training"
            onChange={handleChange}
          />
        </FormControl>
      </Section>

      <Divider my={6} />

      <Flex justify="flex-end" gap={4}>
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button colorScheme="blue" onClick={handleSubmit}>
          Send Request
        </Button>
      </Flex>
    </Box>
  );
}

/* ---------- Section Wrapper ---------- */

function Section({ title, children }) {
  return (
    <Box mb={6}>
      <Heading size="sm" mb={3}>
        {title}
      </Heading>
      <Card>
        <CardBody>
          <Stack spacing={4}>{children}</Stack>
        </CardBody>
      </Card>
    </Box>
  );
}
