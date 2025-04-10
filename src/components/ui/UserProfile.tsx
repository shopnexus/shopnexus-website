"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { ChevronDown, ShoppingBag, User } from "lucide-react"
import PurchaseHistory from "../PurchaseHistory"
import AddressManagement from "../AddressManagement"

type Section = "profile" | "address" | "password" | "orders"
type MainSection = "account" | "orders"

export interface UserInfor {
  Username: string
  password: string
  name: string
  email: string
  phone: string
  gender: string
  birthday: string
}

export interface Address {
  id: string
  name: string
  phone: string
  address: string
  isDefault: boolean
}

const UserProfile = () => {
  const [activeMainSection, setActiveMainSection] = useState<MainSection>("account")
  const [activeSection, setActiveSection] = useState<Section>("profile")
  const [accountExpanded, setAccountExpanded] = useState(true)

  // Refs for measuring submenu height
  const accountSubMenuRef = useRef<HTMLDivElement>(null)

  const [formData, setFormData] = useState({
    username: "ntri2004",
    password: "ntri2004",
    name: "user",
    email: "abcxyz@gmail.com",
    phone: "01234567890",
    gender: "Nam",
    birthDate: "12/01/2000",
  })

  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: "1",
      name: "Nguyễn Văn A",
      phone: "(+84) 123456789",
      address: "123 Đường ABC, Phường XYZ, Quận 1, TP. Hồ Chí Minh",
      isDefault: true,
    },
    {
      id: "2",
      name: "Nguyễn Văn A",
      phone: "(+84) 987654321",
      address: "456 Đường DEF, Phường UVW, Quận 2, TP. Hồ Chí Minh",
      isDefault: false,
    },
  ])

  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null)

  // Find default address
  useEffect(() => {
    const foundDefault = addresses.find((addr) => addr.isDefault)
    setDefaultAddress(foundDefault || null)
  }, [addresses])

  // ẩn hiện số điện thoại
  const ShowHidePhone = ({ phoneNumber }) => {
    const [showPhone, setShowPhone] = useState(false)
    const togglePhoneVisibility = () => {
      setShowPhone((prev) => !prev)
    }

    const displayPhone = showPhone ? phoneNumber : phoneNumber.replace(/\d(?=\d{3})/g, "*")
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleGenderChange = (value: string) => {
    setFormData((prev) => ({ ...prev, gender: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log(formData)
  }

  const handleMainSectionClick = (section: MainSection) => {
    if (section === "account") {
      setAccountExpanded(!accountExpanded)
    }

    setActiveMainSection(section)
    if (section === "account") {
      setActiveSection("profile")
    } else {
      setActiveSection("orders")
    }
  }

  const handleSubSectionClick = (section: Section) => {
    setActiveSection(section)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left sidebar */}
      <div className="w-64 border-r bg-white p-4">
        <div className="flex flex-col items-center mb-6">
          <div className="relative h-20 w-20 mb-2 rounded-full overflow-hidden bg-gray-200 transition-all duration-300 hover:shadow-md">
            <img
              src="/placeholder.svg?height=80&width=80"
              alt="Profile"
              className="h-full w-full object-cover transition-opacity duration-300"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 opacity-0 transition-opacity duration-300 hover:opacity-50">
              <User className="h-10 w-10 text-gray-400" />
            </div>
          </div>
          <div className="text-sm font-medium">{formData.username}</div>
        </div>

        <nav className="space-y-1">
          {/* Account section with toggle */}
          <div
            className={`flex items-center justify-between p-2 cursor-pointer rounded-md transition-colors duration-200 ${activeMainSection === "account" ? "text-orange-500 bg-orange-50 font-medium" : "text-gray-600 hover:bg-gray-100"}`}
            onClick={() => handleMainSectionClick("account")}
          >
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <span>My Account</span>
            </div>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-300 ${accountExpanded ? "rotate-180" : "rotate-0"}`}
            />
          </div>

          {/* Account submenu with smooth height animation */}
          <div
            ref={accountSubMenuRef}
            className="overflow-hidden transition-all duration-300 ease-in-out"
            style={{
              maxHeight: accountExpanded ? "200px" : "0px",
              opacity: accountExpanded ? 1 : 0,
              marginTop: accountExpanded ? "4px" : "0px",
            }}
          >
            <div className="pl-7 space-y-1">
              <div
                className={`p-2 cursor-pointer rounded-md transition-colors duration-200 ${activeSection === "profile" ? "text-orange-500 bg-orange-50 font-medium" : "text-gray-600 hover:bg-gray-100"}`}
                onClick={() => handleSubSectionClick("profile")}
              >
                Profile
              </div>
              <div
                className={`p-2 cursor-pointer rounded-md transition-colors duration-200 ${activeSection === "address" ? "text-orange-500 bg-orange-50 font-medium" : "text-gray-600 hover:bg-gray-100"}`}
                onClick={() => handleSubSectionClick("address")}
              >
                Address
              </div>
              <div
                className={`p-2 cursor-pointer rounded-md transition-colors duration-200 ${activeSection === "password" ? "text-orange-500 bg-orange-50 font-medium" : "text-gray-600 hover:bg-gray-100"}`}
                onClick={() => handleSubSectionClick("password")}
              >
                Change Password
              </div>
            </div>
          </div>

          {/* Orders section */}
          <div
            className={`flex items-center justify-between p-2 cursor-pointer rounded-md transition-colors duration-200 ${activeMainSection === "orders" ? "text-orange-500 bg-orange-50 font-medium" : "text-gray-600 hover:bg-gray-100"}`}
            onClick={() => handleMainSectionClick("orders")}
          >
            <div className="flex items-center gap-2 ">
              <ShoppingBag className="h-5 w-5" />
              <span>My Purchase</span>
            </div>
            {/* <ChevronDown
              className={`h-4 w-4 transition-transform duration-300 ${accountExpanded ? "rotate-180" : "rotate-0"}`}
            /> */}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6">
        {activeSection === "profile" && (
          <div className="bg-white border-0 rounded-md shadow-sm transition-all duration-300 ease-in-out">
            <div className="p-6">
              <div className="mb-6">
                <h1 className="text-xl font-medium">My Profile</h1>
                <p className="text-gray-500 text-sm">Manage your infomation in this profile</p>
              </div>

              <div className="border-t pt-6">
                <form onSubmit={handleSubmit} className="flex">
                  <div className="flex-1 space-y-6 pr-10">
                    <div className="grid grid-cols-[150px_1fr] items-center">
                      <label className="font-medium">User Name</label>
                      <div>{formData.username}</div>
                    </div>

                    <div className="grid grid-cols-[150px_1fr] items-center">
                      <label className="font-medium">Password</label>
                      <div>{formData.password}</div>
                    </div>

                    <div className="grid grid-cols-[150px_1fr] items-center">
                      <label htmlFor="name" className="font-medium">
                        Full Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200"
                      />
                    </div>

                    <div className="grid grid-cols-[150px_1fr] items-center">
                      <label className="font-medium">Email</label>
                      <div className="flex items-center">
                        <span>{formData.email}</span>
                        <button
                          type="button"
                          className="text-blue-500 ml-2 text-sm hover:underline transition-colors duration-200"
                        >
                          Change
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-[150px_1fr] items-center">
                      <label className="font-medium">Phone Number</label>
                      <div className="flex items-center">
                        <span>{formData.phone}</span>
                        <button
                          type="button"
                          className="cursor-pointer text-blue-500 ml-2 text-sm hover:underline transition-colors duration-200"
                        >
                          Change
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-[150px_1fr] items-center">
                      <label className="font-medium">Gender</label>
                      <div className="flex gap-6">
                        {["Male", "Female", "Other"].map((option) => (
                          <label key={option} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="gender"
                              className="w-4 h-4 text-orange-500 transition-colors duration-200"
                              checked={formData.gender === option}
                              onChange={() => handleGenderChange(option)}
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-[150px_1fr] items-center">
                      <label className="font-medium">Birthday</label>
                      <div className="flex items-center">
                        <span>{formData.birthDate}</span>
                        <button
                          type="button"
                          className="text-blue-500 ml-2 text-sm hover:underline transition-colors duration-200"
                        >
                          Change
                        </button>
                      </div>
                    </div>

                    {/* Default Address */}
                    <div className="grid grid-cols-[150px_1fr]">
                      <label className="font-medium pt-1">Default Address</label>
                      <div className="space-y-1">
                        {defaultAddress ? (
                          <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{defaultAddress.name}</span>
                              <span className="text-gray-500">|</span>
                              <span>{defaultAddress.phone}</span>
                              <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded ml-auto">
                                Default
                              </span>
                            </div>
                            <div className="text-gray-700 text-sm">{defaultAddress.address}</div>
                          </div>
                        ) : (
                          <div className="text-gray-500 italic">No default address set</div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleSubSectionClick("address")}
                          className="text-blue-500 text-sm hover:underline transition-colors duration-200"
                        >
                          Manage Addresses
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-[150px_1fr] items-center">
                      <div></div>
                      <button
                        type="submit"
                        className="bg-orange-500 hover:bg-orange-600 text-white w-24 py-2 rounded-md transition-colors duration-200"
                      >
                        Save
                      </button>
                    </div>
                  </div>

                  <div className="w-48 flex flex-col items-center">
                    <div className="border border-dashed rounded-full h-32 w-32 flex items-center justify-center mb-4 hover:border-orange-300 transition-colors duration-200">
                      <div className="relative h-32 w-32 rounded-full overflow-hidden">
                        <img
                          src="/placeholder.svg?height=128&width=128"
                          alt="Profile"
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 opacity-0 hover:opacity-50 transition-opacity duration-300">
                          <User className="h-16 w-16 text-gray-300" />
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm px-3 py-1 rounded-md mb-2 transition-colors duration-200"
                    >
                      Choose Image
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {activeSection === "address" && <AddressManagement addresses={addresses} setAddresses={setAddresses} />}

        {activeSection === "password" && (
          <div className="bg-white border-0 rounded-md shadow-sm transition-all duration-300 ease-in-out">
            <div className="p-6">
              <div className="mb-6">
                <h1 className="text-xl font-medium">Change Password</h1>
                <p className="text-gray-500 text-sm">
                  Do not share your password with anyone to protect your account!
                </p>
              </div>

              <div className="border-t pt-6">
                <form className="max-w-md space-y-6">
                  <div className="grid grid-cols-[150px_1fr] items-center">
                    <label htmlFor="current-password" className="font-medium">
                      Current password
                    </label>
                    <input
                      id="current-password"
                      placeholder="Input your password current"
                      type="password"
                      className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200"
                    />
                  </div>

                  <div className="grid grid-cols-[150px_1fr] items-center">
                    <label htmlFor="new-password" className="font-medium">
                      New password
                    </label>
                    <input
                      id="new-password"
                      placeholder="Input your new password here"
                      type="password"
                      className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200"
                    />
                  </div>

                  <div className="grid grid-cols-[150px_1fr] items-center">
                    <label htmlFor="confirm-password" className="font-medium">
                      Input again
                    </label>
                    <input
                      id="confirm-password"
                      placeholder="Input again to confirm"
                      type="password"
                      className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200"
                    />
                  </div>

                  <div className="grid grid-cols-[150px_1fr] items-center">
                    <div></div>
                    <button
                      type="submit"
                      className="bg-orange-500 hover:bg-orange-600 text-white w-24 py-2 rounded-md transition-colors duration-200"
                    >
                      Confirm
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {activeSection === "orders" && <PurchaseHistory />}
      </div>
    </div>
  )
}

export default UserProfile
