import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  const { title, duration } = await request.json();
  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  const existingTask = await prisma.task.findFirst({
    where: { title: title },
  });

  if (existingTask) {
    return NextResponse.json({ error: 'Task already exists' }, { status: 409 });
  }

  const task = await prisma.task.create({
    data: { 
      title,
      duration: duration || null,
    },
  });
  return NextResponse.json(task);
}
