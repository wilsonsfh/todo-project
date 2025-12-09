import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idString } = await params;
    const id = parseInt(idString);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }
  
    // Use raw query to bypass stale Prisma Client types in dev mode
    await prisma.$executeRaw`
      UPDATE Task 
      SET startedAt = ${new Date()} 
      WHERE id = ${id}
    `;
    
    // Fetch the updated task to return it
    const task = await prisma.task.findUnique({ where: { id } });
    
    return NextResponse.json(task);
  } catch (error) {
    console.error("Error starting task:", error);
    return NextResponse.json({ error: 'Failed to start task' }, { status: 500 });
  }
}
