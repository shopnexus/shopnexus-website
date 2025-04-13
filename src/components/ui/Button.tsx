import type React from "react"
import type { ButtonHTMLAttributes } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline"
  size?: "sm" | "md" | "lg"
}

const Button: React.FC<ButtonProps> = ({ children, variant = "primary", size = "md", className = "", ...props }) => {
  const baseStyles =
    "rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"

  const variantStyles = {
    primary:
      "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg active:scale-95 focus:ring-blue-400",
    secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200 active:scale-95 focus:ring-gray-300",
    outline: "border border-gray-300 text-gray-800 hover:bg-gray-100 active:scale-95 focus:ring-gray-300",
  }

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-5 py-3 text-lg",
  }

  return (
    <button className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`} {...props}>
      {children}
    </button>
  )
}

export default Button
