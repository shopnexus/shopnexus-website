import type React from "react"
import type { ReactNode } from "react"

interface CardProps {
  children: ReactNode
  className?: string
}

const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return <div className={`bg-white shadow-md rounded-lg overflow-hidden ${className}`}>{children}</div>
}

export const CardHeader: React.FC<CardProps> = ({ children, className = "" }) => {
  return <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>{children}</div>
}

export const CardBody: React.FC<CardProps> = ({ children, className = "" }) => {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>
}

export const CardFooter: React.FC<CardProps> = ({ children, className = "" }) => {
  return <div className={`px-6 py-4 border-t border-gray-200 ${className}`}>{children}</div>
}

export default Card

