import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options/options';
import { prisma } from '@/lib/prisma';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user?.email || '' },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get or create chat session
    let chatSession = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: { messages: true },
    });

    if (!chatSession) {
      chatSession = await prisma.chatSession.create({
        data: {
          id: sessionId,
          title: 'New Chat',
          weekStart: new Date(),
          userId: user.id,
        },
        include: { messages: true },
      });
    }

    // Save the new user message
    const lastMessage = messages[messages.length - 1];
    await prisma.message.create({
      data: {
        content: lastMessage.content,
        role: lastMessage.role,
        sessionId: chatSession.id,
      },
    });

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    // Save the AI response
    const aiMessage = completion.choices[0].message;
    await prisma.message.create({
      data: {
        content: aiMessage.content || '',
        role: aiMessage.role,
        sessionId: chatSession.id,
      },
    });

    return NextResponse.json({ response: aiMessage });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Error processing your request' },
      { status: 500 }
    );
  }
}

