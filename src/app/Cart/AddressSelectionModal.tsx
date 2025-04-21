import { X } from "lucide-react";
import Button from "../../components/ui/Button";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { AddressEntity } from "shopnexus-protobuf-gen-ts/pb/account/v1/address_pb";
import { useMutation, useQuery } from "@connectrpc/connect-query";
import { deleteAddress, listAddresses } from "shopnexus-protobuf-gen-ts";

interface AddressSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  addresses: AddressEntity[];
  selectedAddress?: AddressEntity;
  onSelect: (address: AddressEntity) => void;
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
  const [tempSelectedAddress, setTempSelectedAddress] = useState<
    AddressEntity | undefined
  >(selectedAddress);
  const { mutateAsync: mutateDeleteAddress } = useMutation(deleteAddress);
  const { refetch: refetchAddresses } = useQuery(listAddresses, {
    pagination: { page: 1, limit: 10 },
  });

  const handleDelete = async (addressId: bigint) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        await mutateDeleteAddress({ id: addressId });
        await refetchAddresses();

        // If deleted address was selected, clear selection
        if (addressId === tempSelectedAddress?.id) {
          setTempSelectedAddress(undefined);
        }

        // If no addresses left, close modal
        if (addresses.length <= 1) {
          onClose();
        }
      } catch (error) {
        console.error("Failed to delete address:", error);
        alert("Failed to delete address. Please try again.");
      }
    }
  };

  const handleConfirm = () => {
    if (tempSelectedAddress) {
      onSelect(tempSelectedAddress);
      onClose();
    } else {
      alert("Please select an address");
    }
  };

  useEffect(() => {
    setTempSelectedAddress(selectedAddress);
  }, [isOpen, selectedAddress]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-md relative flex flex-col max-h-[80vh]">
        <div className="p-6 border-b">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-semibold">Select Shipping Address</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {addresses.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No addresses found. Please add a new address.
              </div>
            ) : (
              addresses.map((address) => (
                <div
                  key={String(address.id)}
                  className={`w-full text-left p-4 border rounded-lg transition-colors ${
                    tempSelectedAddress?.id === address.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <button
                      className="flex-grow text-left"
                      onClick={() => setTempSelectedAddress(address)}
                    >
                      <div>
                        <p className="font-medium">
                          {address.fullName}
                          {address.isDefault && (
                            <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                              Default
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-600">{address.phone}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {address.address}, {address.city}, {address.country}
                        </p>
                      </div>
                    </button>
                    {!address.isDefault && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="ml-2"
                        onClick={() => handleDelete(address.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-6 border-t bg-white">
          <div className="space-y-3">
            <Button
              onClick={onAddNew}
              variant="outline"
              className="w-full justify-center"
            >
              Add New Address
            </Button>
            <Button
              onClick={handleConfirm}
              className="w-full justify-center"
              disabled={!tempSelectedAddress}
            >
              Confirm Selection
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
