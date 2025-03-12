import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options/options';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user?.email || '' },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const chatSessions = await prisma.chatSession.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 15,
        },
      },
    });

    // Transform the data to match the frontend's expected format
    const formattedSessions = chatSessions.map((session: { id: string; title: string; weekStart: Date; messages: Array<{ id: string; role: string; content: string; }> }) => ({
      id: session.id,
      title: session.title,
      weekStart: session.weekStart,
      messages: session.messages.map((msg: { id: string; role: string; content: string; }) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
      })).reverse(), // Reverse to get chronological order
    }));

    return NextResponse.json(formattedSessions);

  } catch (error) {
    console.error('Error in GET /api/chats:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}