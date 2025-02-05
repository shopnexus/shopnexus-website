// App.tsx
import React, { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';

const App: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="mb-4">
        <button
          onClick={() => setIsLogin(true)}
          className={`px-4 py-2 mr-2 ${isLogin ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
        >
          Đăng nhập
        </button>
        <button
          onClick={() => setIsLogin(false)}
          className={`px-4 py-2 ${!isLogin ? 'bg-green-500 text-white' : 'bg-gray-300'}`}
        >
          Đăng ký
        </button>
      </div>
      {isLogin ? <Login /> : <Register />}
    </div>
  );
};

export default App;
