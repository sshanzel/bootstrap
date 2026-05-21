/* eslint-disable react-refresh/only-export-components */

import type { QueryClient } from '@tanstack/react-query';
import {
  Link,
  Navigate,
  Outlet,
  createRootRouteWithContext,
  createRoute,
} from '@tanstack/react-router';
import {
  ArrowRight,
  Boxes,
  Braces,
  CheckCircle2,
  Code2,
  Database,
  ExternalLink,
  Fingerprint,
  GitBranch,
  KeyRound,
  LogOut,
  PanelLeft,
  ShieldCheck,
  TerminalSquare,
  type LucideIcon,
} from 'lucide-react';
import { useState, type PropsWithChildren, type ReactNode } from 'react';
import { ModeToggle } from '@/components/mode-toggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  getGoogleLoginUrl,
  useLogin,
  useLogout,
  useMe,
  useRegister,
} from '@/lib/auth';

interface RouterContext {
  queryClient: QueryClient;
}

interface AuthLayoutProps extends PropsWithChildren {
  title: string;
  subtitle: string;
  footer: ReactNode;
}

interface AuthFieldProps {
  id: string;
  label: string;
  onChange: (value: string) => void;
  required?: boolean;
  type: 'email' | 'password' | 'text';
  value: string;
  minLength?: number;
}

interface PageMessageProps {
  title: string;
}

interface MetricCardProps {
  Icon: LucideIcon;
  label: string;
  value: string;
}

interface StatusItem {
  description: string;
  label: string;
  state: string;
}

interface StackItem {
  Icon: LucideIcon;
  label: string;
  value: string;
}

interface LandingPrinciple {
  description: string;
  label: string;
  marker: string;
}

interface LandingSystemRow {
  detail: string;
  layer: string;
  signal: string;
}

interface SceneLineProps {
  label: string;
  value: string;
}

interface LandingStatProps {
  label: string;
  value: string;
}

const stackItems: StackItem[] = [
  { Icon: TerminalSquare, label: 'Runtime', value: 'Node 22 + pnpm' },
  { Icon: Database, label: 'Persistence', value: 'PostgreSQL + TypeORM' },
  { Icon: Boxes, label: 'Contracts', value: 'Shared Zod package' },
  { Icon: Code2, label: 'Frontend', value: 'Vite, React, Router, Query' },
];

const statusItems: StatusItem[] = [
  {
    label: 'Cookie session',
    state: 'Unified',
    description: 'Password and Google auth land in the same protected shell.',
  },
  {
    label: 'Shared schema',
    state: 'Centralized',
    description: 'Both apps consume the contracts from @bootstrap/shared.',
  },
  {
    label: 'Starter surface',
    state: 'Ready',
    description: 'The UI is intentionally compact for product work after init.',
  },
];

const landingPrinciples: LandingPrinciple[] = [
  {
    marker: '01',
    label: 'One session path',
    description:
      'Password and Google sign-in converge on the same cookie-backed behavior.',
  },
  {
    marker: '02',
    label: 'Contracts first',
    description:
      'Shared Zod schemas keep the API and web app from inventing separate truths.',
  },
  {
    marker: '03',
    label: 'Small foundation',
    description:
      'The starter stays lean until a product feature earns more surface area.',
  },
];

const landingSystemRows: LandingSystemRow[] = [
  {
    layer: 'apps/api',
    signal: 'NestJS + TypeORM',
    detail:
      'PostgreSQL persistence, migrations, auth, and smoke-tested module wiring.',
  },
  {
    layer: 'apps/web',
    signal: 'Vite + React',
    detail:
      'TanStack Router, Query, semantic tokens, and compact app primitives.',
  },
  {
    layer: 'packages/shared',
    signal: 'Zod contracts',
    detail: 'Request, response, and session shapes exported from one package.',
  },
];

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage,
});

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app',
  component: ProtectedLayout,
});

const appIndexRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/',
  component: AppHomePage,
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  appRoute.addChildren([appIndexRoute]),
]);

function RootLayout() {
  return (
    <div className="relative min-h-screen">
      <div className="fixed right-3 top-3 z-20 md:right-5 md:top-5">
        <ModeToggle />
      </div>
      <Outlet />
    </div>
  );
}

function ProtectedLayout() {
  const { data, isLoading, isError } = useMe();

  if (isLoading) {
    return <PageMessage title="Loading workspace" />;
  }

  if (isError || !data) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="min-h-screen px-4 py-4 md:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl overflow-hidden rounded-lg border border-border bg-background/92 md:grid-cols-[248px_1fr]">
        <aside className="border-b border-border bg-card/92 p-4 md:border-b-0 md:border-r">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground">
              <PanelLeft className="size-5" />
            </div>
            <div>
              <p className="font-display text-xl font-semibold text-display-foreground">
                Bootstrap
              </p>
              <p className="text-xs font-medium text-muted-foreground">
                Full-stack starter
              </p>
            </div>
          </div>

          <nav aria-label="Workspace" className="mt-8 grid gap-1">
            <a
              className="flex cursor-pointer items-center gap-3 rounded-lg bg-secondary px-3 py-2.5 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-secondary/80"
              href="#overview"
            >
              <TerminalSquare className="size-4" />
              Overview
            </a>
            <a
              className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-secondary hover:text-foreground"
              href="#stack"
            >
              <Boxes className="size-4" />
              Stack
            </a>
            <a
              className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-secondary hover:text-foreground"
              href="#identity"
            >
              <Fingerprint className="size-4" />
              Identity
            </a>
          </nav>

          <div className="mt-8 rounded-lg border border-border bg-background p-3">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Active user
            </p>
            <p className="mt-2 truncate text-sm font-semibold text-foreground">
              {data.firstName ?? data.email}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {data.email}
            </p>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="flex flex-col gap-4 border-b border-border bg-card/70 px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <Badge className="mb-3 w-fit">Authenticated</Badge>
              <h1 className="font-display text-3xl font-semibold leading-tight text-display-foreground md:text-4xl">
                Build from a cleaner foundation.
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                The starter now opens into a focused product shell with visible
                auth, contracts, and stack readiness.
              </p>
            </div>
            <LogoutButton />
          </header>

          <Outlet />
        </section>
      </div>
    </main>
  );
}

function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <section className="relative min-h-[88svh] border-b border-border px-4 pb-10 pt-4 md:px-6">
        <LandingBackdrop />
        <div className="relative z-10 mx-auto flex max-w-7xl items-center justify-between gap-4 border-b border-border py-4 pr-36 md:pr-64">
          <Link className="flex items-center gap-3" to="/">
            <div className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground">
              <TerminalSquare className="size-5" />
            </div>
            <div>
              <p className="font-display text-xl font-semibold text-display-foreground">
                Bootstrap
              </p>
              <p className="hidden text-xs font-medium text-muted-foreground sm:block">
                Full-stack starter
              </p>
            </div>
          </Link>

          <nav
            aria-label="Landing"
            className="hidden items-center gap-6 text-sm font-semibold text-muted-foreground md:flex"
          >
            <a className="hover:text-foreground" href="#principles">
              Principles
            </a>
            <a className="hover:text-foreground" href="#system">
              System
            </a>
            <Link className="hover:text-foreground" to="/login">
              Sign in
            </Link>
          </nav>
        </div>

        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 py-12 md:grid-cols-[minmax(0,0.94fr)_minmax(360px,0.7fr)] md:items-center md:py-16 lg:py-20">
          <div className="max-w-4xl">
            <Badge className="mb-6 w-fit">Node 22 monorepo</Badge>
            <h1 className="font-display text-6xl font-semibold leading-[0.9] text-display-foreground sm:text-7xl lg:text-8xl">
              Bootstrap starter
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
              A clean product foundation for shipping a real full-stack app:
              auth, contracts, API, web, database, and local orchestration
              already moving in the same direction.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/register">
                  Create workspace
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/app">Open app shell</Link>
              </Button>
            </div>
          </div>

          <ProductScene />
        </div>

        <div className="relative z-10 mx-auto grid max-w-7xl border-t border-border text-sm md:grid-cols-3">
          <LandingStat label="Generated from" value="one starter" />
          <LandingStat label="Runtime target" value="Node 22" />
          <LandingStat label="Contract layer" value="@bootstrap/shared" />
        </div>
      </section>

      <section
        className="mx-auto grid max-w-7xl gap-8 px-4 py-16 md:grid-cols-[0.7fr_1fr] md:px-6 md:py-24"
        id="principles"
      >
        <div>
          <p className="text-sm font-semibold uppercase text-primary">
            Design posture
          </p>
          <h2 className="mt-4 font-display text-4xl font-semibold leading-tight text-display-foreground md:text-5xl">
            Less template. More product spine.
          </h2>
        </div>
        <div className="border-y border-border">
          {landingPrinciples.map((principle) => (
            <div
              className="grid gap-4 border-b border-border py-6 last:border-b-0 sm:grid-cols-[72px_1fr]"
              key={principle.label}
            >
              <p className="font-display text-3xl font-semibold text-primary">
                {principle.marker}
              </p>
              <div>
                <h3 className="text-xl font-semibold text-foreground">
                  {principle.label}
                </h3>
                <p className="mt-2 max-w-2xl text-base leading-7 text-muted-foreground">
                  {principle.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card/62" id="system">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
          <div className="grid gap-6 md:grid-cols-[0.8fr_1fr] md:items-end">
            <h2 className="font-display text-4xl font-semibold leading-tight text-display-foreground md:text-5xl">
              The starter is small, but the seams are already named.
            </h2>
            <p className="text-base leading-7 text-muted-foreground">
              No fake enterprise shell, no oversized marketing furniture. Just
              the layers you need to make the first product feature feel like it
              belongs to a coherent system.
            </p>
          </div>

          <div className="mt-12 border-t border-border">
            {landingSystemRows.map((row) => (
              <div
                className="grid gap-3 border-b border-border py-5 md:grid-cols-[180px_220px_1fr] md:items-center"
                key={row.layer}
              >
                <p className="font-mono text-sm font-semibold text-primary">
                  {row.layer}
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {row.signal}
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  {row.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 md:grid-cols-[1fr_auto] md:px-6 md:py-20">
        <div>
          <p className="text-sm font-semibold uppercase text-primary">
            Start point
          </p>
          <h2 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-tight text-display-foreground md:text-5xl">
            Copy it, initialize it, then let the product become itself.
          </h2>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row md:items-end">
          <Button asChild size="lg">
            <Link to="/register">Create account</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link to="/login">Sign in</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

function AppHomePage() {
  const { data } = useMe();
  if (!data) {
    return null;
  }

  return (
    <div className="grid gap-6 p-5 md:p-6" id="overview">
      <section className="grid gap-3 md:grid-cols-3">
        {statusItems.map((statusItem) => (
          <Card key={statusItem.label}>
            <CardContent className="grid gap-4 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-foreground">
                  {statusItem.label}
                </p>
                <Badge variant="secondary">{statusItem.state}</Badge>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                {statusItem.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]" id="stack">
        <Card>
          <CardHeader>
            <CardTitle>Starter stack</CardTitle>
            <CardDescription>
              Core pieces are already wired for the first product feature.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {stackItems.map(({ Icon, label, value }) => (
              <div
                className="flex items-center gap-4 rounded-lg border border-border bg-secondary/45 p-3"
                key={label}
              >
                <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-background text-primary">
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    {label}
                  </p>
                  <p className="truncate text-sm font-semibold text-foreground">
                    {value}
                  </p>
                </div>
                <CheckCircle2 className="ml-auto size-5 shrink-0 text-primary" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card id="identity">
          <CardHeader>
            <CardTitle>Identity</CardTitle>
            <CardDescription>
              Session details from the protected `/auth/me` contract.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <MetricCard
              Icon={KeyRound}
              label="Provider"
              value={data.authProvider}
            />
            <MetricCard Icon={ShieldCheck} label="Email" value={data.email} />
            <MetricCard Icon={GitBranch} label="User ID" value={data.id} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function LandingBackdrop() {
  return (
    <div aria-hidden="true" className="absolute inset-0">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,color-mix(in_srgb,var(--border)_42%,transparent)_1px,transparent_1px),linear-gradient(180deg,color-mix(in_srgb,var(--border)_32%,transparent)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="landing-scan absolute inset-x-0 top-0 h-px bg-primary/60" />
    </div>
  );
}

function ProductScene() {
  return (
    <div className="relative min-h-[420px] overflow-hidden border border-border bg-background/78 p-4 md:min-h-[520px]">
      <div className="absolute inset-x-0 top-0 flex h-10 items-center gap-2 border-b border-border bg-card px-4">
        <span className="size-2 rounded-full bg-destructive" />
        <span className="size-2 rounded-full bg-accent" />
        <span className="size-2 rounded-full bg-primary" />
        <span className="ml-3 font-mono text-xs text-muted-foreground">
          bootstrap://workspace
        </span>
      </div>

      <div className="mt-14 grid gap-4">
        <div className="grid grid-cols-[88px_1fr] border border-border">
          <div className="border-r border-border bg-secondary/45 p-3 font-mono text-xs text-muted-foreground">
            api
          </div>
          <div className="grid gap-2 p-3">
            <SceneLine label="auth.module.ts" value="cookie session ready" />
            <SceneLine label="typeorm.config.ts" value="postgres on 5434" />
          </div>
        </div>

        <div className="ml-6 grid grid-cols-[88px_1fr] border border-border">
          <div className="border-r border-border bg-secondary/45 p-3 font-mono text-xs text-muted-foreground">
            web
          </div>
          <div className="grid gap-2 p-3">
            <SceneLine label="routes.tsx" value="public + protected shell" />
            <SceneLine label="tokens.ts" value="semantic theme map" />
          </div>
        </div>

        <div className="ml-12 grid grid-cols-[88px_1fr] border border-border">
          <div className="border-r border-border bg-secondary/45 p-3 font-mono text-xs text-muted-foreground">
            shared
          </div>
          <div className="grid gap-2 p-3">
            <SceneLine label="auth.schema.ts" value="one contract source" />
            <SceneLine label="index.ts" value="workspace export path" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border px-3 py-2">
          <Braces className="size-4 text-primary" />
          <p className="font-mono text-xs font-semibold text-foreground">
            pnpm init:project -- --name "Next Product"
          </p>
        </div>
        <div className="grid grid-cols-3 divide-x divide-border text-center text-xs">
          <p className="py-3 text-muted-foreground">scope</p>
          <p className="py-3 text-muted-foreground">database</p>
          <p className="py-3 text-primary">ready</p>
        </div>
      </div>
    </div>
  );
}

function SceneLine({ label, value }: SceneLineProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
      <p className="truncate font-mono text-xs text-foreground">{label}</p>
      <p className="font-mono text-xs text-muted-foreground">{value}</p>
    </div>
  );
}

function LandingStat({ label, value }: LandingStatProps) {
  return (
    <div className="border-b border-border py-4 md:border-b-0 md:border-r md:px-5 md:last:border-r-0">
      <p className="text-xs font-semibold uppercase text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-semibold text-display-foreground">
        {value}
      </p>
    </div>
  );
}

function LoginPage() {
  const login = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <AuthLayout
      title="Sign in to Bootstrap"
      subtitle="Use the shared session path and jump straight into the starter workspace."
      footer={
        <p className="text-sm leading-6 text-muted-foreground">
          Need an account?{' '}
          <Link
            className="font-semibold text-foreground underline underline-offset-4"
            to="/register"
          >
            Create one
          </Link>
        </p>
      }
    >
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          login.mutate({ email, password });
        }}
      >
        <AuthField
          id="login-email"
          label="Email"
          onChange={setEmail}
          required
          type="email"
          value={email}
        />
        <AuthField
          id="login-password"
          label="Password"
          onChange={setPassword}
          required
          type="password"
          value={password}
        />

        <div className="grid gap-3 pt-2">
          <Button disabled={login.isPending} type="submit">
            {login.isPending ? 'Signing in...' : 'Sign in'}
            <ArrowRight className="size-4" />
          </Button>
          <Button asChild variant="secondary">
            <a href={getGoogleLoginUrl()}>
              <ExternalLink className="size-4" />
              Continue with Google
            </a>
          </Button>
        </div>

        {login.error ? (
          <p
            className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
            role="alert"
          >
            Unable to sign in.
          </p>
        ) : null}
      </form>
    </AuthLayout>
  );
}

function RegisterPage() {
  const register = useRegister();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <AuthLayout
      title="Create your workspace"
      subtitle="Create a test account and land in the protected starter shell."
      footer={
        <p className="text-sm leading-6 text-muted-foreground">
          Already have an account?{' '}
          <Link
            className="font-semibold text-foreground underline underline-offset-4"
            to="/login"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          register.mutate({ firstName, lastName, email, password });
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <AuthField
            id="register-first-name"
            label="First name"
            onChange={setFirstName}
            required
            type="text"
            value={firstName}
          />
          <AuthField
            id="register-last-name"
            label="Last name"
            onChange={setLastName}
            type="text"
            value={lastName}
          />
        </div>
        <AuthField
          id="register-email"
          label="Email"
          onChange={setEmail}
          required
          type="email"
          value={email}
        />
        <AuthField
          id="register-password"
          label="Password"
          minLength={8}
          onChange={setPassword}
          required
          type="password"
          value={password}
        />

        <div className="grid gap-3 pt-2">
          <Button disabled={register.isPending} type="submit">
            {register.isPending ? 'Creating account...' : 'Create account'}
            <ArrowRight className="size-4" />
          </Button>
          <Button asChild variant="secondary">
            <a href={getGoogleLoginUrl()}>
              <ExternalLink className="size-4" />
              Continue with Google
            </a>
          </Button>
        </div>

        {register.error ? (
          <p
            className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
            role="alert"
          >
            Unable to create account.
          </p>
        ) : null}
      </form>
    </AuthLayout>
  );
}

function LogoutButton() {
  const logout = useLogout();

  return (
    <Button onClick={() => logout.mutate()} variant="secondary">
      <LogOut className="size-4" />
      {logout.isPending ? 'Signing out...' : 'Sign out'}
    </Button>
  );
}

function AuthLayout({ title, subtitle, footer, children }: AuthLayoutProps) {
  return (
    <main className="grid min-h-screen px-4 py-4 md:px-6">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-lg border border-border bg-background/92 md:grid-cols-[0.9fr_1fr]">
        <section className="hidden min-h-[calc(100vh-2rem)] border-r border-border bg-card/82 p-8 md:flex md:flex-col md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground">
                <TerminalSquare className="size-5" />
              </div>
              <div>
                <p className="font-display text-xl font-semibold text-display-foreground">
                  Bootstrap
                </p>
                <p className="text-xs font-medium text-muted-foreground">
                  Opinionated starter kit
                </p>
              </div>
            </div>

            <div className="mt-16 max-w-md">
              <Badge className="mb-5 w-fit">Node 22 monorepo</Badge>
              <h1 className="font-display text-5xl font-semibold leading-none text-display-foreground">
                Auth, API, web, and contracts in one clean loop.
              </h1>
              <p className="mt-5 text-base leading-7 text-muted-foreground">
                A quieter interface for the starter you copy when a new product
                needs a reliable foundation fast.
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            {stackItems.slice(0, 3).map(({ Icon, label, value }) => (
              <div
                className="flex items-center gap-3 rounded-lg border border-border bg-background p-3"
                key={label}
              >
                <Icon className="size-4 text-primary" />
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    {label}
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid min-h-screen place-items-center p-5 md:min-h-[calc(100vh-2rem)] md:p-8">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-3">
              <Badge className="w-fit" variant="secondary">
                Secure access
              </Badge>
              <div className="space-y-2">
                <CardTitle>{title}</CardTitle>
                <CardDescription>{subtitle}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid gap-6">
              {children}
              <Separator />
              {footer}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}

function AuthField({
  id,
  label,
  minLength,
  onChange,
  required = false,
  type,
  value,
}: AuthFieldProps) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-semibold text-foreground" htmlFor={id}>
        {label}
      </label>
      <Input
        id={id}
        minLength={minLength}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        type={type}
        value={value}
      />
    </div>
  );
}

function PageMessage({ title }: PageMessageProps) {
  return (
    <main className="grid min-h-screen place-items-center px-5 py-24 md:px-8">
      <Card className="w-full max-w-sm">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="size-3 rounded-full bg-primary" />
          <p className="text-sm font-semibold text-foreground">{title}</p>
        </CardContent>
      </Card>
    </main>
  );
}

function MetricCard({ Icon, label, value }: MetricCardProps) {
  return (
    <div className="grid gap-2 rounded-lg border border-border bg-secondary/45 p-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        <p className="text-xs font-semibold uppercase">{label}</p>
      </div>
      <p className="truncate text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
