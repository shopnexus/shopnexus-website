import React, { useRef } from "react";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  type?: "text" | "email" | "password" | "number";
  className?: string;
  canPastImage?:boolean;
  onImagePaste?: (imageUrl: string[]) => void;
}

const Input: React.FC<InputProps> = ({
  children,
  label,
  value,
  onChange,
  type = "text",
  className = "",
  canPastImage=false,
  onImagePaste,
  ...rest
}) => {

  const inputRef = useRef<HTMLInputElement>(null);

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (!canPastImage || !onImagePaste) return;
  
    const items = Array.from(e.clipboardData.items);
    const urls: string[] = [];
  
    items.forEach(item => {
      if (item.type.startsWith("image")) {
        const file = item.getAsFile();
        if (file) {
          const url = URL.createObjectURL(file);
          urls.push(url);
        }
      }
    });
  
    if (urls.length > 0) {
      onImagePaste(urls);
    }
  };
  
  
  


  return (
    <div className={`w-full ${className}`}>
      {label && <label className="block mb-1 text-sm font-medium text-gray-700">{label}</label>}
      <input
        ref={inputRef}
        value={value}
        onChange={onChange}
        onPaste={handlePaste}
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
