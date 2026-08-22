import React from 'react';
import RegisterForm from '@/components/auth/RegisterForm';

export const metadata = {
  title: 'Sign Up — GlobeTrotter',
  description: 'Create your account to start building itineraries and exploring destinations.',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
