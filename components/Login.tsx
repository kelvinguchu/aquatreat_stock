"use client";
import React, { useState } from 'react';
import { signInWithEmailAndPassword, AuthError } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (error) {
      const authError = error as AuthError;
      if (authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password') {
        setError('Incorrect email or password. Please try again.');
      } else {
        setError('Failed to log in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form onSubmit={handleLogin} className="space-y-4 w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <Image src='/logo.png' alt='Logo' width={170} height={100} className='mx-auto mb-6' />
        <h2 className="text-2xl font-bold text-darkBlue text-center mb-6">Login</h2>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
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
          {loading ? 'Logging in...' : 'Login'}
        </Button>
        <p className="text-center text-darkBlue">
          Don't have an account? <Link href="/signup" className="text-blue-500 hover:underline font-bold">Sign Up</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;