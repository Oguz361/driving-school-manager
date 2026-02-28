"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Car, Eye, EyeOff } from "lucide-react";

const userSchema = z.object({
  username: z.string().min(3, "Benutzername muss mindestens 3 Zeichen haben"),
  password: z
    .string()
    .optional()
    .refine(
      (val) => {
        // Wenn leer oder undefined, ist es ok (für Edit-Mode)
        if (!val || val === "") return true;
        // Wenn nicht leer, muss es die Regeln erfüllen
        return (
          val.length >= 12 &&
          /[A-Z]/.test(val) &&
          /[a-z]/.test(val) &&
          /[0-9]/.test(val) &&
          /[!@#$%^&*(),.?":{}|<>]/.test(val)
        );
      },
      {
        message:
          "Passwort muss mindestens 12 Zeichen haben und Groß-/Kleinbuchstaben, Ziffer und Sonderzeichen enthalten",
      }
    ),
  firstName: z.string().min(2, "Vorname muss mindestens 2 Zeichen haben"),
  lastName: z.string().min(2, "Nachname muss mindestens 2 Zeichen haben"),
  role: z.enum(["OWNER", "ADMIN", "INSTRUCTOR"], { message: "Rolle ist erforderlich" }),
  assignedVehicleId: z.string().uuid().optional().nullable(),
  mustChangePassword: z.boolean(),
});

type UserFormData = z.infer<typeof userSchema>;

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
  assignedVehicleId?: string | null;
  assignedVehicle?: Vehicle | null;
}

interface UserModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: User | null;
  vehicles: Vehicle[];
  currentUserRole: "OWNER" | "ADMIN" | "INSTRUCTOR";
  currentUserId: string;
}

export default function UserModal({
  open,
  onClose,
  onSuccess,
  user,
  vehicles,
  currentUserRole,
  currentUserId,
}: UserModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const isEditing = !!user;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      mustChangePassword: true,
    },
  });

  const selectedRole = watch("role");
  const selectedVehicleId = watch("assignedVehicleId");

  useEffect(() => {
    if (open) {
      setError(null);
      setShowPassword(false);
      if (user) {
        reset({
          username: user.username,
          password: "",
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          assignedVehicleId: user.assignedVehicleId || null,
          mustChangePassword: user.mustChangePassword,
        });
      } else {
        reset({
          username: "",
          password: "",
          firstName: "",
          lastName: "",
          role: "INSTRUCTOR",
          assignedVehicleId: null,
          mustChangePassword: true,
        });
      }
    }
  }, [open, user, reset]);

  // Auto-clear vehicle when role changes to ADMIN or OWNER
  useEffect(() => {
    if (selectedRole === "ADMIN" || selectedRole === "OWNER") {
      setValue("assignedVehicleId", null);
    }
  }, [selectedRole, setValue]);

  const onSubmit = async (data: UserFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const payload: any = {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        role: data.role,
        mustChangePassword: data.mustChangePassword,
        assignedVehicleId: data.assignedVehicleId,
      };

      if (isEditing) {
        // For edit: only include password if it's provided
        if (data.password && data.password.trim() !== "") {
          payload.password = data.password;
        }
      } else {
        // For create: username and password are required
        if (!data.password || data.password.trim() === "") {
          setError("Passwort ist erforderlich");
          setIsLoading(false);
          return;
        }
        payload.username = data.username.trim();
        payload.password = data.password;
      }

      const url = isEditing ? `/api/users/${user.id}` : "/api/users";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error?.message || "Fehler beim Speichern");
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Ein Fehler ist aufgetreten");
    } finally {
      setIsLoading(false);
    }
  };

  const activeVehicles = vehicles.filter((v) => v.isActive);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Benutzer bearbeiten" : "Neuen Benutzer anlegen"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Bearbeiten Sie die Daten des Benutzers."
              : "Legen Sie einen neuen Benutzer an."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="username">Benutzername *</Label>
            <Input
              id="username"
              {...register("username")}
              placeholder="fahrlehrer1"
              disabled={isLoading || isEditing}
            />
            {errors.username && (
              <p className="text-sm text-red-600">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              {isEditing ? "Neues Passwort (optional)" : "Passwort *"}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder={isEditing ? "Leer lassen, um nicht zu ändern" : "••••••••"}
                disabled={isLoading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
            {!isEditing && (
              <p className="text-xs text-muted-foreground">
                Mind. 12 Zeichen, Groß-/Kleinbuchstaben, Ziffer, Sonderzeichen
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Vorname *</Label>
              <Input
                id="firstName"
                {...register("firstName")}
                placeholder="Max"
                disabled={isLoading}
              />
              {errors.firstName && (
                <p className="text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Nachname *</Label>
              <Input
                id="lastName"
                {...register("lastName")}
                placeholder="Mustermann"
                disabled={isLoading}
              />
              {errors.lastName && (
                <p className="text-sm text-red-600">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rolle *</Label>
            {isEditing && user?.id === currentUserId ? (
              <Input
                value={user?.role === "OWNER" ? "Inhaber" : user?.role === "ADMIN" ? "Admin" : "Fahrlehrer"}
                disabled
              />
            ) : (
              <Select
                value={selectedRole}
                onValueChange={(value) => setValue("role", value as "OWNER" | "ADMIN" | "INSTRUCTOR")}
                disabled={isLoading || (isEditing && user?.role === "OWNER")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Rolle wählen" />
                </SelectTrigger>
                <SelectContent>
                  {currentUserRole === "OWNER" && (
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  )}
                  <SelectItem value="INSTRUCTOR">Fahrlehrer</SelectItem>
                </SelectContent>
              </Select>
            )}
            {errors.role && (
              <p className="text-sm text-red-600">{errors.role.message}</p>
            )}
            {currentUserRole !== "OWNER" && !(isEditing && user?.id === currentUserId) && (
              <p className="text-xs text-muted-foreground">
                Nur der Inhaber kann Administratoren erstellen
              </p>
            )}
          </div>

          {selectedRole === "INSTRUCTOR" && (
            <div className="space-y-2">
              <Label htmlFor="assignedVehicleId">Zugewiesenes Fahrzeug (optional)</Label>
              <Select
                value={selectedVehicleId || "none"}
                onValueChange={(value) =>
                  setValue("assignedVehicleId", value === "none" ? null : value)
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Fahrzeug wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Kein Fahrzeug</SelectItem>
                  {activeVehicles.length > 0 && <Separator className="my-1" />}
                  {activeVehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        <span>{vehicle.name}</span>
                        <span className="text-muted-foreground text-xs">
                          ({vehicle.licensePlate})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.assignedVehicleId && (
                <p className="text-sm text-red-600">
                  {errors.assignedVehicleId.message}
                </p>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Spinner className="h-4 w-4" />
              ) : isEditing ? (
                "Speichern"
              ) : (
                "Anlegen"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
