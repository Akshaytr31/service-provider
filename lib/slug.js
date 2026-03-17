import { db } from "@/lib/db";

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
  model = null,
  currentSlug = null,
) {
  // Keep original for back-compat if needed, but this is deprecated in favor of DB version
  let slug = slugify(baseText);
  if (!slug) slug = "user";
  if (currentSlug === slug) return slug;

  let uniqueSlug = slug;
  let counter = 1;

  while (true) {
    // If model is Prisma model
    const existing = await model.findUnique({
      where: { slug: uniqueSlug },
    });

    if (!existing || (currentSlug && existing.slug === currentSlug)) {
      return uniqueSlug;
    }

    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }
}

export async function generateUniqueSlugDb(
  baseText,
  tableName = "users",
  currentSlug = null,
) {
  let slug = slugify(baseText);
  if (!slug) slug = "user";

  if (currentSlug === slug) return slug;

  let uniqueSlug = slug;
  let counter = 1;

  while (true) {
    const [rows] = await db.query(
      `SELECT slug FROM ${tableName} WHERE slug = ?`,
      [uniqueSlug],
    );

    if (rows.length === 0 || (currentSlug && rows[0].slug === currentSlug)) {
      return uniqueSlug;
    }

    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }
}
