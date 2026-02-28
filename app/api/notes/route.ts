import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";

const createNoteSchema = z.object({
  content: z.string().min(1, "Inhalt ist erforderlich").max(2000),
});

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    try {
      const notes = await prisma.note.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
      });

      return NextResponse.json(notes);
    } catch (error) {
      console.error("Get notes error:", error);
      return NextResponse.json(
        { error: { message: "Fehler beim Laden der Notizen" } },
        { status: 500 }
      );
    }
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    try {
      const body = await req.json();

      const validation = createNoteSchema.safeParse(body);
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

      const note = await prisma.note.create({
        data: {
          content: validation.data.content,
          userId: user.id,
        },
      });

      return NextResponse.json(note, { status: 201 });
    } catch (error) {
      console.error("Create note error:", error);
      return NextResponse.json(
        { error: { message: "Fehler beim Erstellen der Notiz" } },
        { status: 500 }
      );
    }
  });
}