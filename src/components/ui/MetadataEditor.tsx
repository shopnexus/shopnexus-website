import { useState } from "react"
import { Plus, X } from "lucide-react"
import Button from "./Button"

interface MetadataField {
  key: string
  value: string
}

interface MetadataEditorProps {
  metadata: Record<string, string>
  onChange: (metadata: Record<string, string>) => void
}

const MetadataEditor = ({ metadata, onChange }: MetadataEditorProps) => {
  const [metadataFields, setMetadataFields] = useState<MetadataField[]>(
    Object.entries(metadata).map(([key, value]) => ({ key, value: String(value) }))
  )
  const [newMetadataKey, setNewMetadataKey] = useState("")
  const [newMetadataValue, setNewMetadataValue] = useState("")

  const addMetadataField = () => {
    if (newMetadataKey.trim() === "") return

    const updatedFields = [
      ...metadataFields,
      { key: newMetadataKey, value: newMetadataValue }
    ]
    setMetadataFields(updatedFields)

    // Update parent component
    const updatedMetadata = updatedFields.reduce((acc, field) => ({
      ...acc,
      [field.key]: field.value
    }), {})
    onChange(updatedMetadata)

    // Clear input fields
    setNewMetadataKey("")
    setNewMetadataValue("")
  }

  const removeMetadataField = (index: number) => {
    const updatedFields = metadataFields.filter((_, i) => i !== index)
    setMetadataFields(updatedFields)

    // Update parent component
    const updatedMetadata = updatedFields.reduce((acc, field) => ({
      ...acc,
      [field.key]: field.value
    }), {})
    onChange(updatedMetadata)
  }

  const updateMetadataField = (index: number, key: string, value: string) => {
    const updatedFields = [...metadataFields]
    updatedFields[index] = { key, value }
    setMetadataFields(updatedFields)

    // Update parent component
    const updatedMetadata = updatedFields.reduce((acc, field) => ({
      ...acc,
      [field.key]: field.value
    }), {})
    onChange(updatedMetadata)
  }

  return (
    <div className="border rounded-lg p-4 space-y-3">
      {/* Existing metadata fields */}
      {metadataFields.map((field, index) => (
        <div key={index} className="flex items-center space-x-2">
          <input
            type="text"
            value={field.key}
            onChange={(e) => updateMetadataField(index, e.target.value, field.value)}
            className="flex-1 px-3 py-2 border rounded-lg"
            placeholder="Key"
          />
          <input
            type="text"
            value={field.value}
            onChange={(e) => updateMetadataField(index, field.key, e.target.value)}
            className="flex-1 px-3 py-2 border rounded-lg"
            placeholder="Value"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => removeMetadataField(index)}
            className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
            title="Remove field"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ))}

      {/* Add new metadata field */}
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={newMetadataKey}
          onChange={(e) => setNewMetadataKey(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-lg"
          placeholder="Key"
        />
        <input
          type="text"
          value={newMetadataValue}
          onChange={(e) => setNewMetadataValue(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-lg"
          placeholder="Value"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={addMetadataField}
          className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
          title="Add field"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

export default MetadataEditor 