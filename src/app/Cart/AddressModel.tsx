// ... existing imports ...
import { useState } from "react";
import { X } from "lucide-react"; // Add these icons
import Button from "../../components/ui/Button";
import { AddressEntity } from "shopnexus-protobuf-gen-ts/pb/account/v1/address_pb";

// Add this new component at the bottom of the file
export function AddressModal({
  isOpen,
  onClose,
  currentAddress,
  onSave,
  title = "Add New Address",
  description = "Please fill in the address details below",
}: {
  isOpen: boolean;
  onClose: () => void;
  currentAddress?: AddressEntity;
  onSave: (address: AddressEntity) => void;
  title?: string;
  description?: string;
}) {
  const [newAddress, setNewAddress] = useState(
    currentAddress || {
      id: BigInt(0),
      fullName: "",
      phone: "",
      address: "",
      city: "",
      country: "",
      isDefault: false,
    }
  );

  const handleSave = () => {
    // Validate required fields
    if (
      !newAddress.fullName ||
      !newAddress.phone ||
      !newAddress.address ||
      !newAddress.city ||
      !newAddress.country
    ) {
      alert("Please fill in all required fields");
      return;
    }

    onSave(newAddress as AddressEntity);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <p className="text-sm text-gray-500 mb-4">{description}</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={newAddress.fullName}
              onChange={(e) =>
                setNewAddress({ ...newAddress, fullName: e.target.value })
              }
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={newAddress.phone}
              onChange={(e) =>
                setNewAddress({ ...newAddress, phone: e.target.value })
              }
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              value={newAddress.address}
              onChange={(e) =>
                setNewAddress({ ...newAddress, address: e.target.value })
              }
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              value={newAddress.city}
              onChange={(e) =>
                setNewAddress({ ...newAddress, city: e.target.value })
              }
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <input
              type="text"
              value={newAddress.country}
              onChange={(e) =>
                setNewAddress({ ...newAddress, country: e.target.value })
              }
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Address</Button>
        </div>
      </div>
    </div>
  );
}
