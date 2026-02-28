import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";

const updateTodoSchema = z.object({
  text: z.string().min(1).max(500).optional(),
  completed: z.boolean().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return withAuth(request, async (req, user) => {
    try {
      const existingTodo = await prisma.todo.findUnique({
        where: { id },
      });

      if (!existingTodo) {
        return NextResponse.json(
          { error: { message: "Todo nicht gefunden" } },
          { status: 404 }
        );
      }

      // Nur eigene Todos bearbeiten
      if (existingTodo.userId !== user.id) {
        return NextResponse.json(
          { error: { message: "Zugriff verweigert" } },
          { status: 403 }
        );
      }

      const body = await req.json();
      const validation = updateTodoSchema.safeParse(body);

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

      const todo = await prisma.todo.update({
        where: { id },
        data: validation.data,
      });

      return NextResponse.json(todo);
    } catch (error) {
      console.error("Update todo error:", error);
      return NextResponse.json(
        { error: { message: "Fehler beim Aktualisieren des Todos" } },
        { status: 500 }
      );
    }
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return withAuth(request, async (req, user) => {
    try {
      const existingTodo = await prisma.todo.findUnique({
        where: { id },
      });

      if (!existingTodo) {
        return NextResponse.json(
          { error: { message: "Todo nicht gefunden" } },
          { status: 404 }
        );
      }

      // Nur eigene Todos löschen
      if (existingTodo.userId !== user.id) {
        return NextResponse.json(
          { error: { message: "Zugriff verweigert" } },
          { status: 403 }
        );
      }

      await prisma.todo.delete({
        where: { id },
      });

      return NextResponse.json({ message: "Todo gelöscht" }, { status: 200 });
    } catch (error) {
      console.error("Delete todo error:", error);
      return NextResponse.json(
        { error: { message: "Fehler beim Löschen des Todos" } },
        { status: 500 }
      );
    }
  });
}
