import { PrismaClient } from "@prisma/client";
import { blogCategories, blogPosts } from "../src/lib/seed/blog-data";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting DB seed...");

  // Extract unique authors from blogPosts
  const uniqueAuthorsMap = new Map();
  for (const post of blogPosts) {
    if (!uniqueAuthorsMap.has(post.author)) {
      uniqueAuthorsMap.set(post.author, {
        name: post.author,
        slug: post.author.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        bio: post.authorBio || "Author bio",
        shortBio: null,
        expertise: ["General"],
      });
    }
  }
  const extractedAuthors = Array.from(uniqueAuthorsMap.values());

  // 1. Seed Authors
  console.log("Seeding authors...");
  const createdAuthors: Record<string, any> = {};
  for (const author of extractedAuthors) {
    if (author.id === "all") continue;
    
    // Check if author exists
    let dbAuthor = await prisma.author.findUnique({ where: { slug: author.slug } });
    
    if (!dbAuthor) {
      dbAuthor = await prisma.author.create({
        data: {
          name: author.name,
          slug: author.slug,
          email: `${author.slug}@amartalim.com`, // Dummy email
          bio: author.bio,
          shortBio: author.shortBio,
          expertise: author.expertise,
          status: "APPROVED",
        }
      });
    }
    createdAuthors[author.slug] = dbAuthor;
    // Map the author name to the DB author for blogs
    createdAuthors[author.name] = dbAuthor;
  }
  
  // 2. Seed Categories
  console.log("Seeding categories...");
  const createdCategories: Record<string, any> = {};
  for (const cat of blogCategories) {
    if (cat.id === "all") continue;
    
    let dbCat = await prisma.blogCategory.findUnique({ where: { slug: cat.id } });
    if (!dbCat) {
      dbCat = await prisma.blogCategory.create({
        data: {
          name: cat.name,
          slug: cat.id,
        }
      });
    }
    createdCategories[cat.id] = dbCat;
  }

  // 3. Seed Blogs
  console.log("Seeding blogs...");
  for (const post of blogPosts) {
    let dbBlog = await prisma.blog.findUnique({ where: { slug: post.slug } });
    if (!dbBlog) {
      const cat = createdCategories[post.categoryId];
      let author = createdAuthors[post.author];
      
      // If author not found by name, create a dummy one
      if (!author) {
        const dummySlug = post.author.toLowerCase().replace(/[^a-z0-9]/g, '-');
        author = await prisma.author.findUnique({ where: { slug: dummySlug } });
        if (!author) {
           author = await prisma.author.create({
             data: {
               name: post.author,
               slug: dummySlug,
               email: `${dummySlug}@amartalim.com`,
               bio: post.authorBio || "No bio provided.",
               status: "APPROVED",
             }
           });
        }
        createdAuthors[post.author] = author;
      }

      await prisma.blog.create({
        data: {
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          coverImage: typeof post.cover === 'string' ? post.cover : post.cover?.src || "",
          published: true,
          publishedAt: new Date(post.date),
          readingTime: post.readTime,
          views: Math.floor(Math.random() * 500) + 50,
          categoryId: cat?.id,
          authorProfileId: author?.id,
          hasAuthorProfile: !!author,
          tags: post.tags || [],
        }
      });
      console.log(`Created blog: ${post.title}`);
    } else {
      console.log(`Blog exists: ${post.title}`);
    }
  }

  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
