import { prisma } from "@/lib/prisma";

export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

export async function generateUniqueSlug(
  baseText,
  model = prisma.users,
  currentSlug = null,
) {
  let slug = slugify(baseText);
  if (!slug) slug = "user"; // Fallback if name is empty or symbols

  // If the generated slug is the same as the current one, return it (no change needed)
  if (currentSlug === slug) return slug;

  // Check if slug exists
  let uniqueSlug = slug;
  let counter = 1;

  while (true) {
    const existing = await model.findUnique({
      where: { slug: uniqueSlug },
    });

    if (!existing || (currentSlug && existing.slug === currentSlug)) {
      // If no conflict, or the conflict is with the user themself (shouldn't happen with findUnique but good practice)
      return uniqueSlug;
    }

    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }
}
