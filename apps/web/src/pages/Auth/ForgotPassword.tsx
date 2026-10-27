import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useForgotPassword } from '@/features/auth/useAuth';
import { useToastStore } from '@/components/ui/Toast';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const forgotPassword = useForgotPassword();
  const addToast = useToastStore((state) => state.addToast);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await forgotPassword.mutateAsync({ email });
      setSubmitted(true);
      addToast('Reset instructions dispatched if the account exists.', 'info');
    } catch {
      addToast('An error occurred. Please try again.', 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-obsidian-950">
      <Card className="w-full max-w-md p-8 glass-panel space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">Reset Password</h2>
          <p className="text-xs text-slate-500">
            Enter your email to receive recovery instructions.
          </p>
        </div>

        {submitted ? (
          <div className="p-4 rounded-xl bg-vital-emerald/10 border border-vital-emerald/20 text-center space-y-3">
            <p className="text-xs text-vital-emerald font-medium">
              If an account is associated with {email}, a secure password reset link has been dispatched.
            </p>
            <Link to="/login" className="block text-xs text-primary-500 font-bold hover:underline">
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="patient@example.com"
              required
            />
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={forgotPassword.isPending}
            >
              Send Reset Link
            </Button>
          </form>
        )}

        <div className="text-center pt-2">
          <Link to="/login" className="text-xs text-slate-400 hover:text-slate-200">
            Back to Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
};
