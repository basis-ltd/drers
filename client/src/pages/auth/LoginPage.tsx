import { zodResolver } from "@hookform/resolvers/zod";
import { useId, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import { BadgeCheck, ClipboardList, MessageSquare, Shield } from "lucide-react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { cn } from "@/lib/utils";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Enter your email address")
    .email("Enter a valid email address"),
  password: z
    .string()
    .min(1, "Enter your password")
    .min(6, "Use at least 6 characters"),
  keepSignedIn: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const linkTextClass =
  "font-normal text-[13px] normal-case tracking-normal text-primary hover:underline underline-offset-2 hover:text-primary/80";

export function LoginPage() {
  const formId = useId();
  const emailId = `${formId}-email`;
  const passwordId = `${formId}-password`;
  const keepId = `${formId}-keep`;

  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      keepSignedIn: false,
    },
  });

  const onSubmit = handleSubmit((data) => {
    console.log(data);
  });

  return (
    <main className="login-shell grid min-h-svh w-full bg-background text-primary lg:grid-cols-[minmax(0,40fr)_minmax(0,60fr)]">
      <aside
        className="login-hero relative flex flex-col justify-between overflow-hidden px-8 py-10 text-primary-foreground sm:px-12 lg:min-h-svh"
        aria-labelledby={`${formId}-hero-heading`}
      >
        <header className="relative z-10 flex items-center gap-3">
          <Shield
            className="size-9 shrink-0 text-primary-foreground/95"
            aria-hidden
          />
          <p className="font-heading text-lg font-semibold leading-tight tracking-tight">
            RNEC{" "}
            <span className="font-semibold uppercase tracking-[0.12em] text-primary-foreground/90">
              RWANDA
            </span>
          </p>
        </header>

        <section className="relative z-10 max-w-md space-y-8 py-10">
          <h1
            id={`${formId}-hero-heading`}
            className="font-heading text-3xl font-semibold leading-tight tracking-tight sm:text-4xl"
          >
            Research Ethics Review System
          </h1>
          <p className="text-base leading-relaxed text-primary-foreground/85">
            Rwanda National Ethics Committee&apos;s digital platform for
            research protocol submission, review, and certification.
          </p>
          <ul className="space-y-5 text-sm leading-snug text-primary-foreground/90">
            <li className="flex gap-3">
              <Shield
                className="mt-0.5 size-4 shrink-0 opacity-70"
                aria-hidden
              />
              <span>Submit research protocols online</span>
            </li>
            <li className="flex gap-3">
              <ClipboardList
                className="mt-0.5 size-4 shrink-0 opacity-70"
                aria-hidden
              />
              <span>Track application status in real time</span>
            </li>
            <li className="flex gap-3">
              <MessageSquare
                className="mt-0.5 size-4 shrink-0 opacity-70"
                aria-hidden
              />
              <span>Respond to reviewer queries</span>
            </li>
            <li className="flex gap-3">
              <BadgeCheck
                className="mt-0.5 size-4 shrink-0 opacity-70"
                aria-hidden
              />
              <span>Download approved clearance certificates</span>
            </li>
          </ul>
        </section>

        <footer className="relative z-10 text-xs text-primary-foreground/55">
          © {new Date().getFullYear()} Rwanda National Ethics Committee — Secure
          platform
        </footer>
      </aside>

      <section
        className="flex flex-col items-center justify-center px-6 py-12 sm:px-12 lg:px-16"
        aria-labelledby={`${formId}-welcome`}
      >
        <article className="flex w-full max-w-md flex-col">
          <header className="mb-8 space-y-2 text-left">
            <h2
              id={`${formId}-welcome`}
              className="font-heading text-3xl font-semibold tracking-tight text-primary"
            >
              Welcome back
            </h2>
            <p className="text-muted-foreground">
              Sign in to your researcher account
            </p>
          </header>

          <form className="w-full space-y-6" onSubmit={onSubmit} noValidate>
            <fieldset className="flex flex-col gap-5 border-0 p-0">
              <legend className="sr-only">Sign-in credentials</legend>

              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input
                    required
                    label="Email address"
                    errorMessage={errors.email?.message}
                    {...field}
                    id={emailId}
                    type="email"
                    autoComplete="email"
                    placeholder="you@institution.rw"
                    aria-describedby={
                      errors.email ? `${emailId}-error` : undefined
                    }
                  />
                )}
              />
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id={passwordId}
                    label="Password"
                    required
                    type={showPassword ? "text" : "password"}
                    suffixIconHandler={(e) => {
                      e.preventDefault();
                      setShowPassword(!showPassword);
                    }}
                    suffixIcon={showPassword ? faEyeSlash : faEye}
                    autoComplete="current-password"
                    placeholder="********"
                    errorMessage={errors.password?.message}
                    aria-describedby={
                      errors.password ? `${passwordId}-error` : undefined
                    }
                    className="pr-11"
                  />
                )}
              />

              <ul className="flex items-center gap-2 justify-between">
                <Controller
                  name="keepSignedIn"
                  control={control}
                  render={({
                    field: { value, onChange, onBlur, name, ref },
                  }) => (
                    <Input
                      label="Keep me signed in for 30 days"
                      ref={ref}
                      id={keepId}
                      name={name}
                      type="checkbox"
                      checked={value}
                      onBlur={onBlur}
                      onChange={(e) => onChange(e.target.checked)}
                      className="size-3 rounded border-input accent-primary"
                    />
                  )}
                />
                <Link
                  to="#"
                  className="text-[12px] text-primary hover:underline underline-offset-2 hover:text-primary"
                >
                  Forgot password?
                </Link>
              </ul>
            </fieldset>

            <Button type="submit" className="w-full rounded-md">
              Sign in to RNEC Portal
            </Button>

            <header className="text-center text-[13px]">
              New researcher?{" "}
              <Link
                to="#"
                onClick={(e) => e.preventDefault()}
                className={cn(linkTextClass)}
              >
                Create an account
              </Link>
            </header>
          </form>
        </article>
      </section>
    </main>
  );
}
