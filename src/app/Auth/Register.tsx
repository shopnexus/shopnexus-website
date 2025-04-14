"use client";

import React, { useState } from "react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import { useMutation } from "@connectrpc/connect-query";
import { registerUser } from "shopnexus-protobuf-gen-ts";
import { Gender } from "shopnexus-protobuf-gen-ts/pb/account/v1/account_pb";

const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<Gender>(Gender.MALE);
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: mutateRegisterUser } = useMutation(registerUser);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const response = await mutateRegisterUser({
        email,
        fullName,
        username,
        password,
        gender,
        phone,
      });
      localStorage.setItem("token", response.token);
      // Registration successful, you can add redirect logic here
      location.href = "/";
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h2 className="text-2xl font-bold text-center">Register</h2>
        </CardHeader>
        <CardBody>
          {error && (
            <div
              className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg"
              role="alert"
            >
              {error}
            </div>
          )}
          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              required
            />
            <Input
              label="Username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="johndoe123"
              required
            />
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <Input
              label="Phone"
              type="number"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1234567890"
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(Number(e.target.value) as Gender)}
                className="px-2 py-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value={Gender.MALE}>Male</option>
                <option value={Gender.FEMALE}>Female</option>
                <option value={Gender.OTHER}>Other</option>
              </select>
            </div>
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <Input
              label="Confirm your password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <Button type="submit" className="w-full cursor-pointer">
              Register
            </Button>
          </form>

          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or</span>
              </div>
            </div>
            <Button variant="outline" className="mt-4 w-full cursor-pointer">
              <svg className="w-5 h-5 mr-2 inline-block" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              With Google
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Register;
