// Register.tsx
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Sau khi đăng ký thành công, bạn có thể chuyển hướng hoặc xử lý logic khác
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 border rounded shadow bg-white mt-6">
      <h2 className="text-2xl font-bold mb-4">Đăng ký</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleRegister} className="flex flex-col gap-3">
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
          className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Đăng ký
        </button>
      </form>
    </div>
  );
};

export default Register;
