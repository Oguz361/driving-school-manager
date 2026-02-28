"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Car,
  Users,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import UserModal from "@/components/users/UserModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Vehicle {
  id: string;
  name: string;
  licensePlate: string;
  transmission: string;
  isActive: boolean;
}

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  role: "OWNER" | "ADMIN" | "INSTRUCTOR";
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: string;
  updatedAt: string;
  assignedVehicleId?: string | null;
  assignedVehicle?: Vehicle | null;
}

interface CurrentUser {
  id: string;
  role: "OWNER" | "ADMIN" | "INSTRUCTOR";
}

function LoadingSkeleton() {
  return (
    <div className="rounded-lg border border-border/60 overflow-hidden">
      <div className="p-4 space-y-3 bg-card">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-4 flex-1 max-w-[150px]" />
            <Skeleton className="h-4 flex-1 max-w-[200px]" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Fehler beim Laden der Benutzer:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const res = await fetch("/api/vehicles", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setVehicles(data);
      }
    } catch (error) {
      console.error("Fehler beim Laden der Fahrzeuge:", error);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser({ id: data.id, role: data.role });
      }
    } catch (error) {
      console.error("Fehler beim Laden des aktuellen Benutzers:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchVehicles();
    fetchCurrentUser();
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    fetchUsers();
    fetchVehicles();
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    handleRefresh();
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleToggleActive = async (user: User) => {
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isActive: !user.isActive }),
      });

      if (res.ok) {
        handleRefresh();
      } else {
        const data = await res.json();
        alert(data.error?.message || "Fehler beim Aktualisieren");
      }
    } catch (error) {
      console.error("Fehler:", error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete || !deletePassword) return;

    setIsDeleting(true);
    setDeleteError("");

    try {
      const res = await fetch(`/api/users/${userToDelete.id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });

      if (res.ok) {
        handleRefresh();
        setDeleteDialogOpen(false);
        setUserToDelete(null);
        setDeletePassword("");
      } else {
        const result = await res.json();
        setDeleteError(result.error?.message || "Fehler beim Löschen");
      }
    } catch (error) {
      console.error("Fehler beim Löschen:", error);
      setDeleteError("Ein Fehler ist aufgetreten");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Benutzerverwaltung
            </h1>
            <p className="text-sm text-muted-foreground">
              Verwalten Sie Administratoren und Fahrlehrer
            </p>
          </div>

          <Button onClick={handleCreateUser}>
            <Plus className="mr-2 h-4 w-4" />
            Neuer Benutzer
          </Button>
        </div>

        {isLoading ? (
          <LoadingSkeleton />
        ) : users.length === 0 ? (
          <div className="rounded-lg border border-border/60 overflow-hidden">
            <div className="text-center py-12 bg-card">
              <div className="flex flex-col items-center justify-center">
                <div className="p-3 rounded-full bg-muted/50 mb-4">
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  Keine Benutzer gefunden
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-border/60 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="font-semibold">Benutzername</TableHead>
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Rolle</TableHead>
                  <TableHead className="font-semibold hidden lg:table-cell">
                    Zugewiesenes Fahrzeug
                  </TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user, index) => (
                  <TableRow
                    key={user.id}
                    className={cn(
                      "transition-colors",
                      index % 2 === 0 && "bg-muted/5",
                      "hover:bg-muted/20"
                    )}
                  >
                    <TableCell className="font-medium">
                      {user.username}
                    </TableCell>
                    <TableCell>
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          user.role === "OWNER"
                            ? "bg-violet-600 text-white hover:bg-violet-700"
                            : user.role === "ADMIN"
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-slate-600 text-white hover:bg-slate-700"
                        }
                      >
                        {user.role === "OWNER"
                          ? "Inhaber"
                          : user.role === "ADMIN"
                          ? "Admin"
                          : "Fahrlehrer"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {user.role === "INSTRUCTOR" && user.assignedVehicle ? (
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {user.assignedVehicle.name}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {user.assignedVehicle.licensePlate}
                          </Badge>
                          {!user.assignedVehicle.isActive && (
                            <Badge variant="destructive" className="text-xs">
                              Inaktiv
                            </Badge>
                          )}
                        </div>
                      ) : user.role === "INSTRUCTOR" ? (
                        <span className="text-sm text-muted-foreground">
                          Kein Fahrzeug
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">–</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.isActive ? "default" : "destructive"}
                      >
                        {user.isActive ? "Aktiv" : "Inaktiv"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {/* OWNER kann nur sich selbst bearbeiten */}
                          {(user.role !== "OWNER" || currentUser?.id === user.id) && (
                            <DropdownMenuItem
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Bearbeiten
                            </DropdownMenuItem>
                          )}
                          {/* OWNER kann nicht deaktiviert werden */}
                          {user.role !== "OWNER" && (
                            <DropdownMenuItem
                              onClick={() => handleToggleActive(user)}
                            >
                              {user.isActive ? (
                                <>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Deaktivieren
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="mr-2 h-4 w-4" />
                                  Reaktivieren
                                </>
                              )}
                            </DropdownMenuItem>
                          )}
                          {/* Löschen nur für OWNER */}
                          {currentUser?.role === "OWNER" && user.role !== "OWNER" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(user)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Löschen
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <UserModal
          open={isModalOpen}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
          user={selectedUser}
          vehicles={vehicles}
          currentUserRole={currentUser?.role || "INSTRUCTOR"}
          currentUserId={currentUser?.id || ""}
        />

        <AlertDialog
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            setDeleteDialogOpen(open);
            if (!open) {
              setDeletePassword("");
              setDeleteError("");
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Benutzer löschen?</AlertDialogTitle>
              <AlertDialogDescription>
                Möchten Sie den Benutzer <strong>{userToDelete?.username}</strong>{" "}
                wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="py-4">
              <Label htmlFor="delete-password">Ihr Passwort zur Bestätigung</Label>
              <Input
                id="delete-password"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Passwort eingeben"
                className="mt-2"
                disabled={isDeleting}
              />
              {deleteError && (
                <p className="text-sm text-red-600 mt-2">{deleteError}</p>
              )}
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Abbrechen</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={isDeleting || !deletePassword}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  "Löschen"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
