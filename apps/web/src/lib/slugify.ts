/**
 * Unicode-aware slugifier — supports Bengali, Arabic, Latin.
 * Stable: a given input always produces the same slug, so we can build
 * lookup URLs like /instructors/{slugify(name)} without a real ID until
 * the Prisma migration adds a `slug` column to User/Author.
 */
export const slugify = (input: string): string =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^\u0980-\u09FF\u0600-\u06FFa-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
