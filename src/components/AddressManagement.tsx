"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"

interface Address {
  id: string
  name: string
  phone: string
  address: string
  isDefault: boolean
}

interface AddressManagementProps {
  addresses: Address[]
  setAddresses: React.Dispatch<React.SetStateAction<Address[]>>
}

export default function AddressManagement({ addresses, setAddresses }: AddressManagementProps) {
  const [newAddress, setNewAddress] = useState<Omit<Address, "id" | "isDefault">>({
    name: "",
    phone: "",
    address: "",
  })

  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Refs for modal handling
  const addModalRef = useRef<HTMLDivElement>(null)
  const editModalRef = useRef<HTMLDivElement>(null)

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isAddModalOpen && addModalRef.current && !addModalRef.current.contains(event.target as Node)) {
        setIsAddModalOpen(false)
      }
      if (isEditModalOpen && editModalRef.current && !editModalRef.current.contains(event.target as Node)) {
        setIsEditModalOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isAddModalOpen, isEditModalOpen])

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isAddModalOpen || isEditModalOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isAddModalOpen, isEditModalOpen])

  const handleAddAddress = () => {
    if (!newAddress.name || !newAddress.phone || !newAddress.address) {
      alert("Please fill in all information")
      return
    }

    const id = Date.now().toString()
    const isDefault = addresses.length === 0 // First address is default

    setAddresses([...addresses, { ...newAddress, id, isDefault }])
    setNewAddress({ name: "", phone: "", address: "" })
    setIsAddModalOpen(false)
  }

  const handleEditAddress = () => {
    if (!editingAddress) return

    setAddresses(addresses.map((addr) => (addr.id === editingAddress.id ? editingAddress : addr)))
    setEditingAddress(null)
    setIsEditModalOpen(false)
  }

  const handleDeleteAddress = (id: string) => {
    const addressToDelete = addresses.find((addr) => addr.id === id)
    if (!addressToDelete) return

    if (window.confirm("Are you sure you want to delete this address?")) {
      const newAddresses = addresses.filter((addr) => addr.id !== id)

      // If we deleted the default address, make the first address the default
      if (addressToDelete.isDefault && newAddresses.length > 0) {
        newAddresses[0].isDefault = true
      }

      setAddresses(newAddresses)
    }
  }

  const handleSetDefault = (id: string) => {
    setAddresses(
      addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      })),
    )
  }

  return (
    <div className="bg-white border-0 rounded-md shadow-sm transition-all duration-300 ease-in-out">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-xl font-medium">Address</h1>
          <p className="text-gray-500 text-sm">Manage Address</p>
        </div>

        <div className="border-t pt-6">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="font-medium">My Address</h2>
            <button
              className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-200 text-sm font-medium"
              onClick={() => setIsAddModalOpen(true)}
            >
              + Add new address
            </button>
          </div>

          {addresses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">You do not have any addresses yet. Please add a new address.</div>
          ) : (
            <div className="space-y-4">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className="border border-gray-200 rounded-md hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-4">
                    <div className="flex justify-between mb-2">
                      <div className="flex gap-4">
                        <div className="font-medium">{address.name}</div>
                        <div className="text-gray-500">|</div>
                        <div>{address.phone}</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="text-blue-500 hover:text-blue-700 text-sm px-2 py-1 bg-transparent border-none cursor-pointer"
                          onClick={() => {
                            setEditingAddress(address)
                            setIsEditModalOpen(true)
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-500 hover:text-red-700 text-sm px-2 py-1 bg-transparent border-none cursor-pointer"
                          onClick={() => handleDeleteAddress(address.id)}
                        >
                          Delete
                        </button>
                        {!address.isDefault && (
                          <button
                            className="text-blue-500 hover:text-blue-700 text-sm px-2 py-1 bg-transparent border-none cursor-pointer"
                            onClick={() => handleSetDefault(address.id)}
                          >
                            Set Default
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="text-gray-700 mb-2">{address.address}</div>
                    {address.isDefault && (
                      <div className="flex gap-2">
                        <div className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded">Default</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Address Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            ref={addModalRef}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Add New Address</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setIsAddModalOpen(false)}>
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  value={newAddress.name}
                  onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  value={newAddress.phone}
                  onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  New Address
                </label>
                <input
                  id="address"
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  value={newAddress.address}
                  onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md mr-2 transition-colors duration-200 text-sm font-medium"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-200 text-sm font-medium"
                onClick={handleAddAddress}
              >
                Add 
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Address Modal */}
      {isEditModalOpen && editingAddress && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            ref={editModalRef}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Edit Address</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setIsEditModalOpen(false)}>
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="edit-name"
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  value={editingAddress.name}
                  onChange={(e) => setEditingAddress({ ...editingAddress, name: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="edit-phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  id="edit-phone"
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  value={editingAddress.phone}
                  onChange={(e) => setEditingAddress({ ...editingAddress, phone: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="edit-address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  id="edit-address"
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  value={editingAddress.address}
                  onChange={(e) => setEditingAddress({ ...editingAddress, address: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md mr-2 transition-colors duration-200 text-sm font-medium"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-200 text-sm font-medium"
                onClick={handleEditAddress}
              >
                Save change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
