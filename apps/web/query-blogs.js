const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.blog.findMany({ select: { slug: true, title: true, status: true, published: true } })
  .then(console.log)
  .finally(() => prisma.$disconnect());
