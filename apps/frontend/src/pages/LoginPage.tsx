import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Input, Button, Card } from '@genzite/shared-ui';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      // Simulated login
      const dummyToken = btoa(`${email}:${Date.now()}`);
      login(dummyToken);
      navigate('/cms');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="bg-zinc-900 border-zinc-800">
          <Card.Header>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white mb-2">Welcome to Genzite</h1>
              <p className="text-zinc-400 text-sm">Sign in to manage your AI workspace</p>
            </div>
          </Card.Header>
          <Card.Body>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="admin@genzite.local"
                value={email}
                onChange={(e: any) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e: any) => setPassword(e.target.value)}
                required
              />
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500">
                Sign In
              </Button>
            </form>
          </Card.Body>
        </Card>
      </motion.div>
    </div>
  );
};
