"use client";
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const SignUp: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/login');
    } catch (error) {
      setError('Failed to sign up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form onSubmit={handleSignUp} className="space-y-4 w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Sign Up</h2>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" className="w-full bg-darkBlue text-white" disabled={loading}>
          {loading ? 'Signing Up...' : 'Sign Up'}
        </Button>
        <p className="text-center">
          Already have an account? <Link href="/login" className="text-blue-500 hover:underline">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default SignUp;