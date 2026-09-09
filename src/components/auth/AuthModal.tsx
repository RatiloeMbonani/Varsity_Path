import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input, Select } from '../common/FormField';
import { Button } from '../common/Button';
import { ErrorBanner } from '../common/ErrorState';
import { useAuth } from '../../context/AuthContext';
import { GradeLevel } from '../../types';
import { Lock, Mail, User, School, Sparkles } from 'lucide-react';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
}) => {
  const { login, register, authError, clearError } = useAuth();
  const [mode, setMode] = useState<'signin' | 'register'>(initialMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [grade, setGrade] = useState<GradeLevel>(12);
  const [school, setSchool] = useState('');
  const [targetUniversity, setTargetUniversity] = useState('University of Cape Town (UCT)');

  const switchMode = (newMode: 'signin' | 'register') => {
    setMode(newMode);
    clearError();
    setValidationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setValidationError('Please enter your email address.');
      return;
    }
    if (!password) {
      setValidationError('Please enter your password.');
      return;
    }

    if (mode === 'register') {
      if (!displayName.trim()) {
        setValidationError('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setValidationError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setValidationError('Passwords do not match.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (mode === 'signin') {
        await login(cleanEmail, password);
      } else {
        await register({
          email: cleanEmail,
          password,
          displayName: displayName.trim(),
          grade: Number(grade) as GradeLevel,
          school: school.trim(),
          targetUniversity,
        });
      }
      onClose();
    } catch {
      // Error handled by AuthContext state (authError)
    } finally {
      setIsSubmitting(false);
    }
  };

  const targetUniOptions = [
    { label: 'University of Cape Town (UCT)', value: 'University of Cape Town (UCT)' },
    { label: 'Stellenbosch University (SU)', value: 'Stellenbosch University (SU)' },
    { label: 'University of the Western Cape (UWC)', value: 'University of the Western Cape (UWC)' },
    { label: 'Cape Peninsula University of Technology (CPUT)', value: 'Cape Peninsula University of Technology (CPUT)' },
    { label: 'Exploring Options', value: 'Exploring Options' },
  ];

  const gradeOptions = [
    { label: 'Grade 12 (Matric)', value: 12 },
    { label: 'Grade 11', value: 11 },
  ];

  const activeError = validationError || authError;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'signin' ? 'Sign In to VarsityPath' : 'Create Student Account'}
      description={
        mode === 'signin'
          ? 'Enter your student credentials to access your personal dashboard.'
          : 'Register your Western Cape Grade 11 or 12 student profile.'
      }
      maxWidth="md"
    >
      {/* Mode Switch Tabs */}
      <div className="flex border border-[#CFE3F1] rounded-xl p-1 bg-[#EDF4FA] mb-6">
        <button
          type="button"
          onClick={() => switchMode('signin')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
            mode === 'signin'
              ? 'bg-white text-[#243A5E] shadow-2xs'
              : 'text-[#5F86A6] hover:text-[#243A5E]'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => switchMode('register')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
            mode === 'register'
              ? 'bg-white text-[#243A5E] shadow-2xs'
              : 'text-[#5F86A6] hover:text-[#243A5E]'
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Error display */}
      {activeError && (
        <div className="mb-4">
          <ErrorBanner
            title="Authentication Notice"
            message={activeError}
            onDismiss={() => {
              setValidationError(null);
              clearError();
            }}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <>
            <Input
              id="student-name"
              label="Full Name"
              type="text"
              required
              placeholder="e.g. Sindi Ndlovu"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                id="student-grade"
                label="Current Grade"
                options={gradeOptions}
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value) as GradeLevel)}
              />

              <Input
                id="student-school"
                label="High School (Western Cape)"
                type="text"
                placeholder="e.g. Rondebosch Boys / Wynberg / Camps Bay"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                leftIcon={<School className="w-4 h-4" />}
              />
            </div>

            <Select
              id="student-target-uni"
              label="Primary Target University"
              options={targetUniOptions}
              value={targetUniversity}
              onChange={(e) => setTargetUniversity(e.target.value)}
            />
          </>
        )}

        <Input
          id="student-email"
          label="Student Email Address"
          type="email"
          required
          placeholder="e.g. student@school.co.za"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
        />

        <Input
          id="student-password"
          label="Password"
          type="password"
          required
          placeholder="••••••••"
          helperText={
            mode === 'register' ? 'Must be at least 6 characters' : undefined
          }
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
        />

        {mode === 'register' && (
          <Input
            id="student-confirm-password"
            label="Confirm Password"
            type="password"
            required
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
          />
        )}

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="w-full"
            leftIcon={mode === 'register' ? <Sparkles className="w-4 h-4" /> : undefined}
          >
            {mode === 'signin' ? 'Sign In' : 'Complete Registration'}
          </Button>
        </div>

        <div className="text-center pt-2">
          {mode === 'signin' ? (
            <p className="text-xs text-[#5F86A6]">
              Don&apos;t have an account yet?{' '}
              <button
                type="button"
                onClick={() => switchMode('register')}
                className="text-[#243A5E] font-bold hover:underline"
              >
                Create your student profile
              </button>
            </p>
          ) : (
            <p className="text-xs text-[#5F86A6]">
              Already registered?{' '}
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className="text-[#243A5E] font-bold hover:underline"
              >
                Sign in to your account
              </button>
            </p>
          )}
        </div>
      </form>
    </Modal>
  );
};
