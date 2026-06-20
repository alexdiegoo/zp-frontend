"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useLogin } from "@/hooks/queries/use-auth";
import { loginSchema, type LoginDto } from "@/lib/validations/auth";
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

export function LoginView() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginDto>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues: { email: "", password: "" },
  });

  const { isValid } = form.formState;
  const { mutate, isPending } = useLogin();

  function onSubmit(values: LoginDto) {
    // onSubmit only fires after Zod validation passes — safe to authenticate.
    mutate(values, {
      onSuccess: () => {
        toast.success("Bem-vindo de volta!");
        router.push("/");
        router.refresh();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <H2>Entrar</H2>
        <Muted>Acesse sua conta para gerenciar suas campanhas.</Muted>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
          className="space-y-4"
        >
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
                <div className="flex items-center justify-between">
                  <FormLabel>Senha</FormLabel>
                  <Link
                    href="/login"
                    className="text-[13px] font-medium text-brand hover:underline"
                  >
                    Esqueci minha senha
                  </Link>
                </div>
                <div className="relative">
                  <FormControl>
                    <Input
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
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
                Entrando…
              </>
            ) : (
              "Entrar"
            )}
          </Button>
        </form>
      </Form>

      <Muted className="text-center">
        Não tem uma conta?{" "}
        <Link
          href="/register"
          className="font-medium text-brand hover:underline"
        >
          Criar uma conta
        </Link>
      </Muted>
    </div>
  );
}
