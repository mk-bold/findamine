import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function promoteToAdmin() {
  try {
    const user = await prisma.user.update({
      where: { email: 'admin@findamine.com' },
      data: { role: 'ADMIN' },
    });
    
    console.log('User promoted to admin:', user);
  } catch (error) {
    console.error('Error promoting user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

promoteToAdmin(); 