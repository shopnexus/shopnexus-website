// Login.tsx
import React, { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from './firebase';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Sau khi đăng nhập thành công, bạn có thể chuyển hướng hoặc xử lý logic khác
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      // Sau khi đăng nhập thành công, bạn có thể chuyển hướng hoặc xử lý logic khác
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 border rounded shadow bg-white">
      <h2 className="text-2xl font-bold mb-4">Đăng nhập</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleLogin} className="flex flex-col gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="p-2 border rounded"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mật khẩu"
          required
          className="p-2 border rounded"
        />
        <button
          type="submit"
          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Đăng nhập
        </button>
      </form>
      <div className="mt-4">
        <button
          onClick={handleGoogleLogin}
          className="p-2 w-full bg-red-500 text-black rounded hover:bg-red-600"
        >
          Đăng nhập bằng Google
        </button>
      </div>
    </div>
  );
};

export default Login;
