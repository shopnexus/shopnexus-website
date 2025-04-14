import React from "react"

interface RadioGroupProps {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  name: string
}

export default function RadioGroup({ value, onChange, options, name }: RadioGroupProps) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((option) => (
        <label key={option.value} className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="form-radio text-green-600 focus:ring-green-500"
          />
          <span className="text-gray-800">{option.label}</span>
        </label>
      ))}
    </div>
  )
}
