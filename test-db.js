const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Attempting to create task with duration...');
    const task = await prisma.task.create({
      data: {
        title: 'Test Task ' + Date.now(),
        duration: 30,
      },
    });
    console.log('Success! Created task:', task);
  } catch (e) {
    console.error('Error creating task:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
