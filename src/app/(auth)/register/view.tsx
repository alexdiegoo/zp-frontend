"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useRegister } from "@/hooks/queries/use-auth";
import { registerSchema, type RegisterDto } from "@/lib/validations/auth";
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
import { H2, Muted } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

type Strength = {
  score: 0 | 1 | 2 | 3;
  label: string;
  barClass: string;
  widthClass: string;
};

function getStrength(password: string): Strength {
  if (!password) {
    return { score: 0, label: "", barClass: "bg-transparent", widthClass: "w-0" };
  }
  let points = 0;
  if (password.length >= 8) points += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) points += 1;
  if (/\d/.test(password)) points += 1;
  if (/[^A-Za-z0-9]/.test(password)) points += 1;

  if (points <= 1) {
    return { score: 1, label: "Fraca", barClass: "bg-destructive", widthClass: "w-1/3" };
  }
  if (points <= 3) {
    return { score: 2, label: "Média", barClass: "bg-brand", widthClass: "w-2/3" };
  }
  return { score: 3, label: "Forte", barClass: "bg-primary", widthClass: "w-full" };
}

export function RegisterView() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<RegisterDto>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { isValid } = form.formState;
  const { mutate, isPending } = useRegister();

  const password = useWatch({ control: form.control, name: "password" });
  const strength = useMemo(() => getStrength(password), [password]);

  function onSubmit(values: RegisterDto) {
    // onSubmit only fires after Zod validation passes — safe to create the account.
    // Only the backend payload fields are forwarded (terms/confirm are UI-only).
    mutate(
      { name: values.name, email: values.email, password: values.password },
      {
        onSuccess: () => {
          toast.success("Conta criada com sucesso!");
          router.push("/");
          router.refresh();
        },
        onError: (error) => {
          toast.error(error.message);
        },
      },
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <H2>Criar conta</H2>
        <Muted>Comece a disparar campanhas em poucos minutos.</Muted>
      </div>

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
                <FormLabel>Nome completo</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    autoComplete="name"
                    placeholder="Maria Silva"
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
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder="voce@clinica.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      className="pr-10"
                      {...field}
                    />
                  </FormControl>
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>

                {password ? (
                  <div className="space-y-1 pt-0.5">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          strength.barClass,
                          strength.widthClass
                        )}
                      />
                    </div>
                    <p className="text-[11px] font-medium text-muted-foreground">
                      Força da senha:{" "}
                      <span className="text-foreground">{strength.label}</span>
                    </p>
                  </div>
                ) : null}

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar senha</FormLabel>
                <FormControl>
                  <Input
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={!isValid || isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin" />
                Criando conta…
              </>
            ) : (
              "Criar conta"
            )}
          </Button>
        </form>
      </Form>

      <Muted className="text-center">
        Já tem uma conta?{" "}
        <Link href="/login" className="font-medium text-brand hover:underline">
          Entrar
        </Link>
      </Muted>
    </div>
  );
}
