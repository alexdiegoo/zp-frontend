"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useCreateClinic } from "@/hooks/queries/use-clinics";
import { writeActiveClinicId } from "@/lib/clinic-tenant";
import {
  createClinicSchema,
  type CreateClinicDto,
} from "@/lib/validations/clinic";
import type { Clinic } from "@/types/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CreateClinicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after a clinic is created and made active. */
  onCreated?: (clinic: Clinic) => void;
}

export function CreateClinicDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateClinicDialogProps) {
  const qc = useQueryClient();
  const createClinic = useCreateClinic();

  const form = useForm<CreateClinicDto>({
    resolver: zodResolver(createClinicSchema),
    mode: "onChange",
    defaultValues: { name: "", category: "" },
  });

  function handleOpenChange(next: boolean) {
    if (!next) form.reset();
    onOpenChange(next);
  }

  function onSubmit(values: CreateClinicDto) {
    createClinic.mutate(values, {
      onSuccess: (clinic) => {
        // Make the new clinic active and refetch everything against it.
        writeActiveClinicId(clinic.id);
        qc.invalidateQueries();
        toast.success("Clínica cadastrada com sucesso!");
        form.reset();
        onOpenChange(false);
        onCreated?.(clinic);
      },
      onError: (error) => toast.error(error.message),
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cadastrar clínica</DialogTitle>
          <DialogDescription>
            Crie a clínica que você vai gerenciar na ZapBlast. Você pode
            adicionar outras depois.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da clínica</FormLabel>
                  <FormControl>
                    <Input
                      autoFocus
                      placeholder="Clínica Vida & Saúde"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Área de atuação</FormLabel>
                  <FormControl>
                    <Input placeholder="Odontologia, Dermatologia…" {...field} />
                  </FormControl>
                  <FormDescription>
                    A especialidade ou segmento principal da clínica.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="submit"
                disabled={!form.formState.isValid || createClinic.isPending}
              >
                {createClinic.isPending ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Cadastrando…
                  </>
                ) : (
                  "Cadastrar clínica"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
