"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { useCreatePatient } from "@/hooks/queries/use-patients";
import {
  cleanPatientPayload,
  createPatientSchema,
  type CreatePatientDto,
} from "@/lib/validations/patient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DEFAULT_VALUES: CreatePatientDto = {
  name: "",
  whatsappNumber: "",
  email: "",
  birthDate: "",
  address: "",
  acquisitionSource: "",
};

/** "Cadastrar paciente" action + dialog form, validated client-side with Zod. */
export function CreatePatientDialog() {
  const [open, setOpen] = useState(false);

  const form = useForm<CreatePatientDto>({
    resolver: zodResolver(createPatientSchema),
    mode: "onChange",
    defaultValues: DEFAULT_VALUES,
  });

  const { mutate, isPending } = useCreatePatient();

  function handleOpenChange(next: boolean) {
    if (!next) form.reset(DEFAULT_VALUES);
    setOpen(next);
  }

  function onSubmit(values: CreatePatientDto) {
    // Only fires after Zod validation passes — safe to forward to the backend.
    mutate(cleanPatientPayload(values), {
      onSuccess: (patient) => {
        toast.success(`${patient.name} cadastrado com sucesso.`);
        handleOpenChange(false);
      },
      onError: (error) => toast.error(error.message),
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Cadastrar paciente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cadastrar paciente</DialogTitle>
          <DialogDescription>
            Adicione um novo paciente à clínica ativa.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="create-patient-form"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Maria Silva" autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="whatsappNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      autoComplete="tel"
                      placeholder="+55 (11) 99999-8888"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    E-mail{" "}
                    <span className="font-normal text-muted-foreground">
                      (opcional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder="maria@email.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Data de nascimento{" "}
                    <span className="font-normal text-muted-foreground">
                      (opcional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="acquisitionSource"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Origem{" "}
                    <span className="font-normal text-muted-foreground">
                      (opcional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Indicação, Instagram…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Endereço{" "}
                    <span className="font-normal text-muted-foreground">
                      (opcional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Rua, número, cidade" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button
            type="submit"
            form="create-patient-form"
            disabled={!form.formState.isValid || isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin" />
                Cadastrando…
              </>
            ) : (
              "Cadastrar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
