import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useLogin } from '@/features/auth/useAuth';
import { useToastStore } from '@/components/ui/Toast';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useLogin();
  const navigate = useNavigate();
  const addToast = useToastStore((state) => state.addToast);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login.mutateAsync({ email, password });
      addToast('Welcome back! Session authorized.', 'success');
      navigate('/dashboard');
    } catch {
      addToast('Invalid email or password credentials.', 'error');
    }
  };

  const handleDemoAccess = async () => {
    try {
      await login.mutateAsync({ email: 'patient@dailyhealth.internal', password: 'demo-password' });
      addToast('Welcome! Exploring in Preview / Demo Mode.', 'success');
      navigate('/dashboard');
    } catch {
      addToast('Could not start demo session.', 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-obsidian-950">
      <Card className="w-full max-w-md p-8 glass-panel space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-vital-emerald flex items-center justify-center text-white mx-auto font-black shadow-lg shadow-primary-500/20">
            ✚
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">Sign In</h2>
          <p className="text-xs text-slate-500">Access your 3D health companion telemetry</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="patient@example.com"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            required
          />

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs text-primary-500 hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" variant="primary" className="w-full" isLoading={login.isPending}>
            Sign In
          </Button>

          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={handleDemoAccess}
          >
            Explore in Demo Mode
          </Button>
        </form>

        <p className="text-center text-xs text-slate-500 pt-2">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-500 font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </Card>
    </div>
  );
};
