"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { useCreateProcedure } from "@/hooks/queries/use-procedures";
import {
  cleanProcedurePayload,
  createProcedureSchema,
  type CreateProcedureDto,
} from "@/lib/validations/procedure";
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
import { Textarea } from "@/components/ui/textarea";

const DEFAULT_VALUES: CreateProcedureDto = {
  name: "",
  description: "",
  basePrice: "",
};

/** "Cadastrar procedimento" action + dialog form, validated client-side with Zod. */
export function CreateProcedureDialog() {
  const [open, setOpen] = useState(false);

  const form = useForm<CreateProcedureDto>({
    resolver: zodResolver(createProcedureSchema),
    mode: "onChange",
    defaultValues: DEFAULT_VALUES,
  });

  const { mutate, isPending } = useCreateProcedure();

  function handleOpenChange(next: boolean) {
    if (!next) form.reset(DEFAULT_VALUES);
    setOpen(next);
  }

  function onSubmit(values: CreateProcedureDto) {
    // Only fires after Zod validation passes — safe to forward to the backend.
    mutate(cleanProcedurePayload(values), {
      onSuccess: (procedure) => {
        toast.success(`${procedure.name} cadastrado com sucesso.`);
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
          Cadastrar procedimento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cadastrar procedimento</DialogTitle>
          <DialogDescription>
            Adicione um novo procedimento ao catálogo da clínica ativa.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="create-procedure-form"
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
                    <Input placeholder="Limpeza de pele" autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="basePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Valor base{" "}
                    <span className="font-normal text-muted-foreground">
                      (opcional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input inputMode="decimal" placeholder="150,00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Descrição{" "}
                    <span className="font-normal text-muted-foreground">
                      (opcional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Detalhes do procedimento…"
                      {...field}
                    />
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
            form="create-procedure-form"
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
