"use client";

import { useState, useEffect } from "react";
import { useForm, Resolver } from "react-hook-form";
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
import { AlertCircle } from "lucide-react";

const vehicleSchema = z.object({
  name: z.string().min(2, "Name muss mindestens 2 Zeichen haben"),
  licensePlate: z.string().min(3, "Kennzeichen muss mindestens 3 Zeichen haben"),
  transmission: z.enum(["MANUAL", "AUTOMATIC"], {
    message: "Bitte Getriebeart wählen",
  }),
  oilChangeKm: z.union([
    z.number().int().min(0, "Kilometerstand muss positiv sein"),
    z.literal("").transform(() => undefined),
    z.null(),
    z.undefined(),
  ]).optional(),
});

type VehicleFormData = {
  name: string;
  licensePlate: string;
  transmission: "MANUAL" | "AUTOMATIC";
  oilChangeKm?: number | null;
};

interface Vehicle {
  id: string;
  name: string;
  licensePlate: string;
  transmission: "MANUAL" | "AUTOMATIC";
  isActive: boolean;
  oilChangeKm?: number | null;
}

interface VehicleModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vehicle: Vehicle | null;
}

export default function VehicleModal({
  open,
  onClose,
  onSuccess,
  vehicle,
}: VehicleModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!vehicle;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema) as Resolver<VehicleFormData>,
    defaultValues: {
      transmission: "MANUAL",
    },
  });

  const selectedTransmission = watch("transmission");

  useEffect(() => {
    if (open) {
      setError(null);
      if (vehicle) {
        reset({
          name: vehicle.name,
          licensePlate: vehicle.licensePlate,
          transmission: vehicle.transmission,
          oilChangeKm: vehicle.oilChangeKm ?? undefined,
        });
      } else {
        reset({
          name: "",
          licensePlate: "",
          transmission: "MANUAL",
          oilChangeKm: undefined,
        });
      }
    }
  }, [open, vehicle, reset]);

  const onSubmit = async (data: VehicleFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const payload: any = {
        name: data.name.trim(),
        licensePlate: data.licensePlate.trim().toUpperCase(),
        transmission: data.transmission,
        oilChangeKm: data.oilChangeKm ?? null,
      };

      const url = isEditing ? `/api/vehicles/${vehicle.id}` : "/api/vehicles";
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Fahrzeug bearbeiten" : "Neues Fahrzeug anlegen"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Bearbeiten Sie die Daten des Fahrzeugs."
              : "Legen Sie ein neues Fahrzeug an."}
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
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="z.B. Fahrschulwagen 1"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="licensePlate">Kennzeichen *</Label>
            <Input
              id="licensePlate"
              {...register("licensePlate")}
              placeholder="z.B. M-FS 1234"
              disabled={isLoading}
              className="uppercase"
            />
            {errors.licensePlate && (
              <p className="text-sm text-red-600">{errors.licensePlate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="transmission">Getriebe *</Label>
            <Select
              value={selectedTransmission}
              onValueChange={(value) =>
                setValue("transmission", value as "MANUAL" | "AUTOMATIC")
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Getriebe wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MANUAL">Schaltung</SelectItem>
                <SelectItem value="AUTOMATIC">Automatik</SelectItem>
              </SelectContent>
            </Select>
            {errors.transmission && (
              <p className="text-sm text-red-600">{errors.transmission.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="oilChangeKm">Ölwechsel (km)</Label>
            <Input
              id="oilChangeKm"
              type="number"
              {...register("oilChangeKm")}
              placeholder="z.B. 45000"
              disabled={isLoading}
            />
            {errors.oilChangeKm && (
              <p className="text-sm text-red-600">{errors.oilChangeKm.message}</p>
            )}
          </div>

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
