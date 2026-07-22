import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up orphaned RoleApplications...');
  
  const apps = await prisma.roleApplication.findMany({
    where: { status: 'APPROVED' },
    include: { user: true }
  });

  for (const app of apps) {
    if (app.role === 'AUTHOR') {
      const author = await prisma.author.findUnique({ where: { email: app.user.email } });
      if (!author) {
        console.log(`Deleting orphaned AUTHOR application for ${app.user.email}`);
        await prisma.roleApplication.delete({ where: { id: app.id } });
      }
    } else if (app.role === 'MUFTI') {
      const mufti = await prisma.mufti.findUnique({ where: { email: app.user.email } });
      if (!mufti) {
        console.log(`Deleting orphaned MUFTI application for ${app.user.email}`);
        await prisma.roleApplication.delete({ where: { id: app.id } });
      }
    }
  }
  
  console.log('Cleanup complete.');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
