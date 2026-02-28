import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";

const createTodoSchema = z.object({
  text: z.string().min(1, "Text ist erforderlich").max(500),
});

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    try {
      const todos = await prisma.todo.findMany({
        where: { userId: user.id },
        orderBy: [
          { completed: "asc" },
          { createdAt: "desc" },
        ],
      });

      return NextResponse.json(todos);
    } catch (error) {
      console.error("Get todos error:", error);
      return NextResponse.json(
        { error: { message: "Fehler beim Laden der Todos" } },
        { status: 500 }
      );
    }
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    try {
      const body = await req.json();

      const validation = createTodoSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          {
            error: {
              message: "Ungültige Eingabe",
              details: validation.error.issues,
            },
          },
          { status: 400 }
        );
      }

      const todo = await prisma.todo.create({
        data: {
          text: validation.data.text,
          userId: user.id,
        },
      });

      return NextResponse.json(todo, { status: 201 });
    } catch (error) {
      console.error("Create todo error:", error);
      return NextResponse.json(
        { error: { message: "Fehler beim Erstellen des Todos" } },
        { status: 500 }
      );
    }
  });
}