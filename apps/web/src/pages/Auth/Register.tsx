import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useRegister } from '@/features/auth/useAuth';
import { useToastStore } from '@/components/ui/Toast';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const register = useRegister();
  const navigate = useNavigate();
  const addToast = useToastStore((state) => state.addToast);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register.mutateAsync({ name, email, password });
      addToast('Account created! Welcome to Daily Health Companion.', 'success');
      navigate('/dashboard');
    } catch {
      addToast('Registration failed. Please check inputs.', 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-obsidian-950">
      <Card className="w-full max-w-md p-8 glass-panel space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-vital-emerald flex items-center justify-center text-white mx-auto font-black shadow-lg shadow-primary-500/20">
            ✚
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">Create Account</h2>
          <p className="text-xs text-slate-500">Begin your 3D health and medication tracking journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            required
          />
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="patient@example.com"
            required
          />
          <Input
            label="Password (min 10 characters)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            required
          />

          <Button type="submit" variant="primary" className="w-full" isLoading={register.isPending}>
            Register
          </Button>
        </form>

        <p className="text-center text-xs text-slate-500 pt-2">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-500 font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </Card>
    </div>
  );
};
