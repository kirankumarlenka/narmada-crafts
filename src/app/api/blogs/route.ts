import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

// Public: Fetch all published blog posts
export async function GET() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(posts);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 });
  }
}

// Admin: Create new blog post
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { title, type, content, mediaUrl } = await req.json();

    if (!title || !type) {
      return NextResponse.json({ error: "Title and Type are required" }, { status: 400 });
    }

    const newPost = await prisma.blogPost.create({
      data: {
        title,
        type, // "TEXT", "IMAGE", or "VIDEO"
        content: content || null,
        mediaUrl: mediaUrl || null,
      },
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create post" }, { status: 500 });
  }
}
