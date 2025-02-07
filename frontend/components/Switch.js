"use client"
import { useState, useEffect } from "react"

export default function Switch({ checked = false, onChange }) {
  const [isChecked, setIsChecked] = useState(checked)

  useEffect(() => {
    setIsChecked(checked)
  }, [checked])

  const handleChange = () => {
    const newValue = !isChecked
    setIsChecked(newValue)
    onChange(newValue)
  }

  return (
    <button
      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
        isChecked ? "bg-green-500" : "bg-gray-300"
      }`}
      onClick={handleChange}
      role="switch"
      aria-checked={isChecked}
      type="button"
    >
      <span className="sr-only">Toggle status</span>
      <span
        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
          isChecked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  )
}