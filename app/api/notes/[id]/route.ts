import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";

const updateNoteSchema = z.object({
  content: z.string().min(1).max(2000),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return withAuth(request, async (req, user) => {
    try {
      const existingNote = await prisma.note.findUnique({
        where: { id },
      });

      if (!existingNote) {
        return NextResponse.json(
          { error: { message: "Notiz nicht gefunden" } },
          { status: 404 }
        );
      }

      // Nur eigene Notizen bearbeiten
      if (existingNote.userId !== user.id) {
        return NextResponse.json(
          { error: { message: "Zugriff verweigert" } },
          { status: 403 }
        );
      }

      const body = await req.json();
      const validation = updateNoteSchema.safeParse(body);

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

      const note = await prisma.note.update({
        where: { id },
        data: { content: validation.data.content },
      });

      return NextResponse.json(note);
    } catch (error) {
      console.error("Update note error:", error);
      return NextResponse.json(
        { error: { message: "Fehler beim Aktualisieren der Notiz" } },
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
      const existingNote = await prisma.note.findUnique({
        where: { id },
      });

      if (!existingNote) {
        return NextResponse.json(
          { error: { message: "Notiz nicht gefunden" } },
          { status: 404 }
        );
      }

      // Nur eigene Notizen löschen
      if (existingNote.userId !== user.id) {
        return NextResponse.json(
          { error: { message: "Zugriff verweigert" } },
          { status: 403 }
        );
      }

      await prisma.note.delete({
        where: { id },
      });

      return NextResponse.json({ message: "Notiz gelöscht" }, { status: 200 });
    } catch (error) {
      console.error("Delete note error:", error);
      return NextResponse.json(
        { error: { message: "Fehler beim Löschen der Notiz" } },
        { status: 500 }
      );
    }
  });
}
