/* eslint-disable react-refresh/only-export-components */

import type { QueryClient } from '@tanstack/react-query';
import {
  Link,
  Navigate,
  Outlet,
  createRootRouteWithContext,
  createRoute,
} from '@tanstack/react-router';
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
      <div className="fixed right-3 top-3 z-10 md:right-5 md:top-5">
        <ModeToggle />
      </div>
      <Outlet />
    </div>
  );
}

function HomeRedirect() {
  const { data, isLoading } = useMe();
  if (isLoading) {
    return <PageMessage title="Loading session..." />;
  }
  return <Navigate to={data ? '/app' : '/login'} replace />;
}

function ProtectedLayout() {
  const { data, isLoading, isError } = useMe();

  if (isLoading) {
    return <PageMessage title="Loading your starter app..." />;
  }

  if (isError || !data) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="mx-auto grid min-h-screen max-w-6xl gap-6 px-5 py-24 md:px-8">
      <header className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
        <div className="space-y-4">
          <Badge>Authenticated</Badge>
          <div className="space-y-2">
            <h1 className="font-display text-display-foreground text-4xl leading-none tracking-[-0.05em] md:text-6xl">
              Welcome back, {data.firstName ?? data.email}
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              The foundation is ready: reusable components, shared contracts,
              and cookie-backed auth are wired together.
            </p>
          </div>
        </div>
        <LogoutButton />
      </header>

      <Card className="overflow-hidden border-border/70 bg-card/92">
        <CardContent className="p-0">
          <Outlet />
        </CardContent>
      </Card>
    </main>
  );
}

function AppHomePage() {
  const { data } = useMe();
  if (!data) {
    return null;
  }

  return (
    <div className="grid gap-8 p-7 md:p-10">
      <div className="space-y-3">
        <Badge variant="secondary">Foundation ready</Badge>
        <div className="space-y-3">
          <h2 className="font-display text-display-foreground text-3xl tracking-[-0.05em]">
            A compact full-stack starter is ready for the next product idea.
          </h2>
          <p className="max-w-3xl text-base leading-7 text-muted-foreground">
            Components read semantic tokens like `background`, `primary`,
            `border`, and `muted`. The API, web app, and shared package already
            agree on the auth contract.
          </p>
        </div>
      </div>

      <Separator />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Email" value={data.email} />
        <MetricCard label="Auth provider" value={data.authProvider} />
        <MetricCard label="User ID" value={data.id} />
      </div>
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
      subtitle="Low-noise design, reusable primitives, and a session model shared across password and Google auth."
      footer={
        <p className="text-sm leading-6 text-muted-foreground">
          Need an account?{' '}
          <Link
            className="text-foreground underline underline-offset-4"
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
        <div className="grid gap-2">
          <label
            className="text-sm font-medium text-muted-foreground"
            htmlFor="login-email"
          >
            Email
          </label>
          <Input
            id="login-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <label
            className="text-sm font-medium text-muted-foreground"
            htmlFor="login-password"
          >
            Password
          </label>
          <Input
            id="login-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <div className="grid gap-3 pt-2">
          <Button disabled={login.isPending} type="submit">
            {login.isPending ? 'Signing in...' : 'Sign in'}
          </Button>
          <Button asChild variant="secondary">
            <a href={getGoogleLoginUrl()}>Continue with Google</a>
          </Button>
        </div>

        {login.error ? (
          <p className="rounded-2xl bg-destructive/12 px-4 py-3 text-sm text-destructive">
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
      title="Create your Bootstrap account"
      subtitle="Create a test account and land directly in the protected starter shell."
      footer={
        <p className="text-sm leading-6 text-muted-foreground">
          Already have an account?{' '}
          <Link
            className="text-foreground underline underline-offset-4"
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
        <div className="grid gap-2">
          <label
            className="text-sm font-medium text-muted-foreground"
            htmlFor="register-first-name"
          >
            First name
          </label>
          <Input
            id="register-first-name"
            type="text"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <label
            className="text-sm font-medium text-muted-foreground"
            htmlFor="register-last-name"
          >
            Last name
          </label>
          <Input
            id="register-last-name"
            type="text"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <label
            className="text-sm font-medium text-muted-foreground"
            htmlFor="register-email"
          >
            Email
          </label>
          <Input
            id="register-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <label
            className="text-sm font-medium text-muted-foreground"
            htmlFor="register-password"
          >
            Password
          </label>
          <Input
            id="register-password"
            minLength={8}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <div className="grid gap-3 pt-2">
          <Button disabled={register.isPending} type="submit">
            {register.isPending ? 'Creating account...' : 'Create account'}
          </Button>
          <Button asChild variant="secondary">
            <a href={getGoogleLoginUrl()}>Continue with Google</a>
          </Button>
        </div>

        {register.error ? (
          <p className="rounded-2xl bg-destructive/12 px-4 py-3 text-sm text-destructive">
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
      {logout.isPending ? 'Signing out...' : 'Sign out'}
    </Button>
  );
}

function AuthLayout({
  title,
  subtitle,
  footer,
  children,
}: PropsWithChildren<{
  title: string;
  subtitle: string;
  footer: ReactNode;
}>) {
  return (
    <main className="grid min-h-screen place-items-center px-5 py-24 md:px-8">
      <Card className="w-full max-w-xl border-border/70 bg-card/92">
        <CardHeader className="space-y-4">
          <Badge className="w-fit">Bootstrap</Badge>
          <div className="space-y-3">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{subtitle}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6">
          {children}
          {footer}
        </CardContent>
      </Card>
    </main>
  );
}

function PageMessage({ title }: { title: string }) {
  return (
    <main className="grid min-h-screen place-items-center px-5 py-24 md:px-8">
      <Card className="w-full max-w-md border-border/70 bg-card/92">
        <CardHeader className="space-y-4">
          <Badge className="w-fit">Bootstrap</Badge>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      </Card>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="gap-3 border-border/70 bg-secondary/55">
      <CardContent className="grid gap-3 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
        <p className="text-sm leading-7 text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}
