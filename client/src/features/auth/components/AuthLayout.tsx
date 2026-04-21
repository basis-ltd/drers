import type { ReactNode } from "react";
import { useId, useMemo } from "react";
import { BadgeCheck, ClipboardList, MessageSquare, Shield } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const formId = useId();

  const featureList = useMemo(
    () => [
      {
        icon: (
          <Shield className="mt-0.5 size-4 shrink-0 opacity-70" aria-hidden />
        ),
        title: "Submit research protocols online",
      },
      {
        icon: (
          <ClipboardList
            className="mt-0.5 size-4 shrink-0 opacity-70"
            aria-hidden
          />
        ),
        title: "Track application status in real time",
      },
      {
        icon: (
          <MessageSquare
            className="mt-0.5 size-4 shrink-0 opacity-70"
            aria-hidden
          />
        ),
        title: "Respond to reviewer queries",
      },
      {
        icon: (
          <BadgeCheck
            className="mt-0.5 size-4 shrink-0 opacity-70"
            aria-hidden
          />
        ),
        title: "Download approved clearance certificates",
      },
    ],
    [],
  );

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
          <p className="font-heading text-[13px] font-semibold leading-tight tracking-tight">
            RNEC{" "}
            <p className="font-semibold uppercase tracking-[0.12em] text-[13px] text-primary-foreground/90">
              RWANDA
            </p>
          </p>
        </header>

        <section className="relative z-10 max-w-md space-y-8 py-10">
          <h1
            id={`${formId}-hero-heading`}
            className="heading-auth text-white! leading-tight sm:text-[30px]"
          >
            Research Ethics Review System
          </h1>
          <p className="text-base leading-relaxed text-primary-foreground/85">
            Rwanda National Ethics Committee&apos;s digital platform for
            research protocol submission, review, and certification.
          </p>
          <ul className="space-y-5 text-[13px] leading-snug text-primary-foreground/90">
            {featureList.map((feature) => (
              <li key={feature.title} className="flex gap-3">
                <figure className="flex items-center justify-center size-5 shrink-0 text-white!">
                  {feature.icon}
                </figure>
                <span className="text-[13px] font-light leading-tight text-primary-foreground/90">
                  {feature.title}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <footer className="relative z-10 text-xs text-primary-foreground/55">
          © {new Date().getFullYear()} Rwanda National Ethics Committee | Secure
          platform
        </footer>
      </aside>

      <section className="flex flex-col items-center justify-center px-6 py-12 sm:px-12 lg:px-16">
        <article className="flex w-full max-w-md flex-col">{children}</article>
      </section>
    </main>
  );
}
