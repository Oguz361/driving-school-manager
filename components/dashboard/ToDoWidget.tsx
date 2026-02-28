"use client";

import { useState, useEffect } from "react";
import { Check, Plus, Trash2, X, ListTodo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

export default function TodoWidget() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTodoText, setNewTodoText] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      const res = await fetch("/api/todos", { credentials: "include" });
      if (res.ok) {
        setTodos(await res.json());
      }
    } catch (error) {
      console.error("Fehler beim Laden der Todos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addTodo = async () => {
    if (!newTodoText.trim()) return;
    setIsAdding(true);
    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text: newTodoText.trim() }),
      });
      if (res.ok) {
        const todo = await res.json();
        setTodos((prev) => [todo, ...prev]);
        setNewTodoText("");
        setShowInput(false);
      }
    } catch (error) {
      console.error("Fehler beim Erstellen:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ completed: !completed }),
      });
      if (res.ok) {
        setTodos((prev) =>
          prev.map((t) => (t.id === id ? { ...t, completed: !completed } : t))
        );
      }
    } catch (error) {
      console.error("Fehler beim Aktualisieren:", error);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setTodos((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (error) {
      console.error("Fehler beim Löschen:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTodo();
    } else if (e.key === "Escape") {
      setShowInput(false);
      setNewTodoText("");
    }
  };

  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length;

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <ListTodo className="h-5 w-5 text-emerald-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Aufgaben</h2>
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
          <div className="p-2 bg-emerald-50 rounded-lg">
            <ListTodo className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Aufgaben</h2>
            {totalCount > 0 && (
              <p className="text-xs text-slate-500">
                {completedCount} von {totalCount} erledigt
              </p>
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
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Neue Aufgabe..."
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            disabled={isAdding}
            className="border-slate-200 focus:border-amber-400 focus:ring-amber-400"
          />
          <Button
            size="icon"
            onClick={addTodo}
            disabled={isAdding || !newTodoText.trim()}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            {isAdding ? <Spinner className="h-4 w-4" /> : <Check className="h-4 w-4" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              setShowInput(false);
              setNewTodoText("");
            }}
            className="hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="space-y-1 max-h-[280px] overflow-y-auto">
        {todos.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <ListTodo className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-slate-500 text-sm">Keine Aufgaben vorhanden</p>
            <p className="text-slate-400 text-xs mt-1">Klicke auf + um eine hinzuzufügen</p>
          </div>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg group transition-all duration-200",
                todo.completed
                  ? "bg-slate-50"
                  : "hover:bg-slate-50"
              )}
            >
              <button
                onClick={() => toggleTodo(todo.id, todo.completed)}
                className={cn(
                  "w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200",
                  todo.completed
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "border-slate-300 hover:border-emerald-400 hover:bg-emerald-50"
                )}
              >
                {todo.completed && <Check className="h-3 w-3" />}
              </button>
              <span
                className={cn(
                  "flex-1 text-sm transition-all duration-200",
                  todo.completed
                    ? "line-through text-slate-400"
                    : "text-slate-700"
                )}
              >
                {todo.text}
              </span>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all duration-200"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
