'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IconEye, IconEyeOff } from '@tabler/icons-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check for error from NextAuth callback
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      switch (errorParam) {
        case 'CredentialsSignin':
          setError('Ungültige Anmeldedaten');
          break;
        case 'invalid_credentials':
          setError('Ungültige Anmeldedaten');
          break;
        case 'account_disabled':
          setError('Ihr Konto wurde deaktiviert');
          break;
        default:
          setError('Ein Fehler ist aufgetreten');
      }
    }
  }, [searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const redirectTo = session.user.role === 'ADMIN' || session.user.role === 'OWNER'
        ? '/dashboard'
        : '/kalender';
      router.push(redirectTo);
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        switch (result.error) {
          case 'CredentialsSignin':
          case 'invalid_credentials':
            setError('Ungültige Anmeldedaten');
            break;
          case 'account_disabled':
            setError('Ihr Konto wurde deaktiviert');
            break;
          default:
            setError('Login fehlgeschlagen');
        }
        setIsLoading(false);
        return;
      }

      // Success - router.refresh to get new session, then redirect
      router.refresh();
    } catch (err) {
      console.error('Login error:', err);
      setError('Netzwerkfehler. Bitte versuchen Sie es erneut.');
      setIsLoading(false);
    }
  };

  // Show nothing while checking session
  if (status === 'loading') {
    return null;
  }

  // Don't show login form if already authenticated
  if (status === 'authenticated') {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md shadow-lg border-border/50">
        <CardHeader className="space-y-2 flex flex-col items-center text-center pt-10 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold">
              Meine Fahrschule
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Benutzername</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                required
                autoFocus
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <IconEyeOff className="h-4 w-4" />
                  ) : (
                    <IconEye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Anmeldung läuft...' : 'Anmelden'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
