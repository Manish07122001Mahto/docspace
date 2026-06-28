import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api, type ApiUser } from '@/lib/api';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [seededUsers, setSeededUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const cachedUser = localStorage.getItem('user');
    if (cachedUser) {
      navigate('/dashboard');
    }

    // Load seeded users
    api.users
      .list()
      .then((users) => {
        setSeededUsers(users);
      })
      .catch((err) => {
        console.error('Failed to load users:', err);
      });
  }, [navigate]);

  const handleSeededUserSelect = (userId: string) => {
    const user = seededUsers.find((u) => u.id === userId);
    if (user) {
      setEmail(user.email);
      setName(user.name);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await api.users.login(email, name);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check the backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-10">
      <Card className="w-full max-w-md shadow-lg border border-slate-200">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md">
            <FileText className="size-6" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Welcome to Docspace</CardTitle>
            <CardDescription className="text-sm">Sign in to continue editing documents.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-xs font-medium text-destructive">
                {error}
              </div>
            )}

            {seededUsers.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="seeded-user">Quick Select (Reviewer Account)</Label>
                <select
                  id="seeded-user"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  onChange={(e) => handleSeededUserSelect(e.target.value)}
                  defaultValue=""
                >
                  <option value="" disabled>
                    -- Choose seeded account --
                  </option>
                  {seededUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                Full Name <span className="text-xs text-muted-foreground">(Optional for existing users)</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full font-medium" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Enter a new email and name to auto-register.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
