"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Car,
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
import VehicleModal from "@/components/vehicles/VehicleModal";
import { cn } from "@/lib/utils";

interface AssignedUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
}

interface Vehicle {
  id: string;
  name: string;
  licensePlate: string;
  transmission: "MANUAL" | "AUTOMATIC";
  isActive: boolean;
  notes?: string | null;
  oilChangeKm?: number | null;
  createdAt: string;
  updatedAt: string;
  assignedToUsers?: AssignedUser[];
}

function LoadingSkeleton() {
  return (
    <div className="rounded-lg border border-border/60 overflow-hidden">
      <div className="p-4 space-y-3 bg-card">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 flex-1 max-w-[150px]" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    fetchVehicles();
  };

  const handleCreateVehicle = () => {
    setSelectedVehicle(null);
    setIsModalOpen(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedVehicle(null);
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    setSelectedVehicle(null);
    handleRefresh();
  };

  const handleDeleteClick = (vehicle: Vehicle) => {
    setVehicleToDelete(vehicle);
    setDeleteError(null);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!vehicleToDelete) return;

    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/vehicles/${vehicleToDelete.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        handleRefresh();
        setDeleteDialogOpen(false);
        setVehicleToDelete(null);
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

  const getTransmissionLabel = (transmission: string) => {
    return transmission === "MANUAL" ? "Schaltung" : "Automatik";
  };

  return (
    <div className="min-h-screen">
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Fahrzeugverwaltung
            </h1>
            <p className="text-sm text-muted-foreground">
              Verwalten Sie die Fahrzeuge Ihrer Fahrschule
            </p>
          </div>

          <Button onClick={handleCreateVehicle}>
            <Plus className="mr-2 h-4 w-4" />
            Neues Fahrzeug
          </Button>
        </div>

        {isLoading ? (
          <LoadingSkeleton />
        ) : vehicles.length === 0 ? (
          <div className="rounded-lg border border-border/60 overflow-hidden">
            <div className="text-center py-12 bg-card">
              <div className="flex flex-col items-center justify-center">
                <div className="p-3 rounded-full bg-muted/50 mb-4">
                  <Car className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  Keine Fahrzeuge gefunden
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-border/60 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Kennzeichen</TableHead>
                  <TableHead className="font-semibold hidden md:table-cell">
                    Getriebe
                  </TableHead>
                  <TableHead className="font-semibold hidden lg:table-cell">
                    Ölwechsel
                  </TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.map((vehicle, index) => (
                  <TableRow
                    key={vehicle.id}
                    className={cn(
                      "transition-colors",
                      index % 2 === 0 && "bg-muted/5",
                      "hover:bg-muted/20"
                    )}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{vehicle.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{vehicle.licensePlate}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {getTransmissionLabel(vehicle.transmission)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {vehicle.oilChangeKm != null ? (
                        <span className="tabular-nums">{vehicle.oilChangeKm.toLocaleString("de-DE")} km</span>
                      ) : (
                        <span className="text-muted-foreground">–</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEditVehicle(vehicle)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Bearbeiten
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(vehicle)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Löschen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <VehicleModal
          open={isModalOpen}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
          vehicle={selectedVehicle}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Fahrzeug löschen?</AlertDialogTitle>
              <AlertDialogDescription>
                Möchten Sie das Fahrzeug <strong>{vehicleToDelete?.name}</strong>{" "}
                ({vehicleToDelete?.licensePlate}) wirklich löschen? Diese Aktion
                kann nicht rückgängig gemacht werden.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {deleteError && (
              <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/50 p-3 rounded-md">
                {deleteError}
              </div>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Abbrechen</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteConfirm();
                }}
                disabled={isDeleting}
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
