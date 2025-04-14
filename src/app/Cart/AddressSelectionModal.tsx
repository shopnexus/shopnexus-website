import { X } from "lucide-react";
import Button from "../../components/ui/Button";
import { useEffect, useState } from "react";
import clsx from "clsx";

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  district: string;
  city: string;
  isDefault?: boolean;
}

interface AddressSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  addresses: Address[];
  selectedAddress: Address;
  onSelect: (address: Address) => void;
  onAddNew: () => void;
}

export function AddressSelectionModal({
  isOpen,
  onClose,
  addresses,
  selectedAddress,
  onSelect,
  onAddNew,
}: AddressSelectionModalProps) {
  const [tempSelectedAddress, setTempSelectedAddress] =
    useState<Address>(selectedAddress);

  const handleConfirm = () => {
    onSelect(tempSelectedAddress);
    onClose();
  };

  useEffect(() => {
    setTempSelectedAddress(selectedAddress);
  }, [isOpen, selectedAddress]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-md relative flex flex-col max-h-[80vh]">
        {/* Fixed Header */}
        <div className="p-6 border-b">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-semibold">Select Shipping Address</h2>
        </div>

        {/* Scrollable Address List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {addresses.map((address) => (
              <button
                key={address.id}
                type="button"
                className={`w-full text-left p-4 border border-gray-400 rounded-lg cursor-pointer transition-colors ${
                  tempSelectedAddress.id === address.id
                    ? "opacity-100"
                    : "opacity-50"
                }`}
                onClick={() => {
                  setTempSelectedAddress(address);
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">
                      {address.fullName}
                      {address.isDefault && (
                        <span className="ml-2 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">
                          Default
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600">{address.phone}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {address.address}, {address.district}, {address.city}
                    </p>
                  </div>
                  <div className="w-4 h-4 rounded-full border-2 border-gray-600 flex-shrink-0 mt-1">
                    {tempSelectedAddress.id === address.id && (
                      <div
                        className={clsx(
                          "w-2 h-2 m-0.5 rounded-full bg-primary",
                          {
                            "opacity-100 bg-black":
                              tempSelectedAddress.id === address.id,
                            "opacity-0": tempSelectedAddress.id !== address.id,
                          }
                        )}
                      />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="p-6 border-t bg-white">
          <div className="space-y-3">
            <Button
              onClick={onAddNew}
              variant="outline"
              className="w-full justify-center"
            >
              Add New Address
            </Button>
            <Button onClick={handleConfirm} className="w-full justify-center">
              {tempSelectedAddress.id === selectedAddress.id
                ? "Current Address"
                : "Confirm Selection"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
