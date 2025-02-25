import type React from "react"
import type { LabelHTMLAttributes } from "react"

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

const Label: React.FC<LabelProps> = ({ children, required = false, className = "", ...props }) => {
  return (
    <label className={`block text-gray-700 text-sm font-bold mb-2 ${className}`} {...props}>
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  )
}

export default Label

