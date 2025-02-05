// InputBar.tsx
import React, { useState } from 'react';
import { isValidEmail, isValidPhone } from '../utils/validators'; // Import hàm kiểm tra

export interface InputBarProps {
  value: string;
  type?: 'text' | 'email' | 'phone';
  placeholder?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputBar: React.FC<InputBarProps> = ({
  value,
  type = 'text',
  placeholder = 'Nhập nội dung...',
  onChange,
}) => {
  const [error, setError] = useState<string>('');

  const handleBlur = () => {
    if (type === 'email' && !isValidEmail(value)) {
      setError('Email không hợp lệ');
    } else if (type === 'phone' && !isValidPhone(value)) {
      setError('Số điện thoại không hợp lệ');
    } else {
      setError('');
    }
  };

  return (
    <div className="w-full mb-4">
      <input
        type={type === 'phone' ? 'text' : type} // Nếu là phone, dùng text để tự do định dạng
        value={value}
        onChange={onChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default InputBar;
