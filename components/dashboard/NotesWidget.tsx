"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface Note {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export default function NotesWidget() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const res = await fetch("/api/notes", { credentials: "include" });
      if (res.ok) {
        setNotes(await res.json());
      }
    } catch (error) {
      console.error("Fehler beim Laden der Notizen:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addNote = async () => {
    if (!newNoteContent.trim()) return;
    setIsAdding(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: newNoteContent.trim() }),
      });
      if (res.ok) {
        const note = await res.json();
        setNotes((prev) => [note, ...prev]);
        setNewNoteContent("");
        setShowInput(false);
      }
    } catch (error) {
      console.error("Fehler beim Erstellen:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const updateNote = async (id: string) => {
    if (!editContent.trim()) return;
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: editContent.trim() }),
      });
      if (res.ok) {
        const updated = await res.json();
        setNotes((prev) =>
          prev.map((n) => (n.id === id ? updated : n))
        );
        setEditingId(null);
        setEditContent("");
      }
    } catch (error) {
      console.error("Fehler beim Aktualisieren:", error);
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setNotes((prev) => prev.filter((n) => n.id !== id));
      }
    } catch (error) {
      console.error("Fehler beim Löschen:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addNote();
    } else if (e.key === "Escape") {
      setShowInput(false);
      setNewNoteContent("");
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      updateNote(id);
    } else if (e.key === "Escape") {
      setEditingId(null);
      setEditContent("");
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-violet-50 rounded-lg">
            <StickyNote className="h-5 w-5 text-violet-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Notizen</h2>
        </div>
        <div className="flex justify-center py-8">
          <Spinner className="h-6 w-6 text-amber-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-50 rounded-lg">
            <StickyNote className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Notizen</h2>
            {notes.length > 0 && (
              <p className="text-xs text-slate-500">{notes.length} Einträge</p>
            )}
          </div>
        </div>
        {!showInput && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowInput(true)}
            className="h-9 w-9 rounded-lg hover:bg-amber-50 hover:text-amber-600"
          >
            <Plus className="h-5 w-5" />
          </Button>
        )}
      </div>

      {showInput && (
        <div className="mb-4">
          <textarea
            placeholder="Neue Notiz..."
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            disabled={isAdding}
            className="w-full p-3 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all"
            rows={3}
          />
          <div className="flex justify-end gap-2 mt-3">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowInput(false);
                setNewNoteContent("");
              }}
              className="text-slate-600 hover:bg-slate-100"
            >
              Abbrechen
            </Button>
            <Button
              size="sm"
              onClick={addNote}
              disabled={isAdding || !newNoteContent.trim()}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              {isAdding ? <Spinner className="h-4 w-4" /> : "Speichern"}
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3 max-h-[280px] overflow-y-auto">
        {notes.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <StickyNote className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-slate-500 text-sm">Keine Notizen vorhanden</p>
            <p className="text-slate-400 text-xs mt-1">Klicke auf + um eine hinzuzufügen</p>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="p-4 bg-slate-50 border border-slate-100 rounded-lg group relative hover:bg-slate-100 transition-colors duration-200"
            >
              {editingId === note.id ? (
                <div>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    onKeyDown={(e) => handleEditKeyDown(e, note.id)}
                    autoFocus
                    className="w-full p-3 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                    rows={3}
                  />
                  <div className="flex justify-end gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(null);
                        setEditContent("");
                      }}
                      className="text-slate-600 hover:bg-slate-200"
                    >
                      Abbrechen
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => updateNote(note.id)}
                      disabled={!editContent.trim()}
                      className="bg-amber-500 hover:bg-amber-600 text-white"
                    >
                      Speichern
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap pr-16 leading-relaxed">
                    {note.content}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    {format(new Date(note.updatedAt), "d. MMM, HH:mm", { locale: de })}
                  </p>
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingId(note.id);
                        setEditContent(note.content);
                      }}
                      className="p-1.5 rounded-md text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-all"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
