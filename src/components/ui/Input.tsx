import React from "react";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  type?: "text" | "email" | "password" | "number";
  className?: string;
}

const Input: React.FC<InputProps> = ({
  children,
  label,
  value,
  onChange,
  type = "text",
  className = "",
  ...rest
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && <label className="block mb-1 text-sm font-medium text-gray-700">{label}</label>}
      <input
        value={value}
        onChange={onChange}
        type={type}
        className="
          block w-full px-4 py-2 
          bg-white text-gray-800 
          placeholder-gray-400 border border-gray-300 
          rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
        "
        {...rest}
      />
    </div>
  );
};

export default Input;
