import React from "react"
import type { InputHTMLAttributes } from "react"

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  onCheckedChange?: () => void;
  checked?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({ label='', className = "", onCheckedChange, checked = false, ...props }) => {
  return (
    <label className="flex items-center space-x-2 cursor-pointer">
      <input
        type="checkbox"
        className={`form-checkbox h-5 w-5 text-blue-600 transition duration-150 ease-in-out ${className}`}
        onChange={onCheckedChange}
        checked={checked}
        {...props}
      />
      <span className="text-gray-700">{label}</span>
    </label>
  )
}

export default Checkbox