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

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomeRedirect,
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

function HomeRedirect() {
  const { data, isLoading } = useMe();
  if (isLoading) {
    return <PageMessage title="Checking session" />;
  }
  return <Navigate to={data ? '/app' : '/login'} replace />;
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
