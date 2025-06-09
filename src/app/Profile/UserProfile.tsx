"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  ShoppingBag,
  User,
  Eye,
  EyeOff,
  LogOut,
} from "lucide-react";
import PurchaseHistory from "../../components/PurchaseHistory";
import AddressManagement from "../../components/AddressManagement";
import { useMutation, useQuery } from "@connectrpc/connect-query";
import {
  getUser,
  listAddresses,
  updateAccount,
  updateUser,
} from "shopnexus-protobuf-gen-ts";
import { Gender } from "shopnexus-protobuf-gen-ts/pb/account/v1/account_pb";
import * as tus from "tus-js-client";
import { BASE_URL } from "../../core/query-client";

type Section = "profile" | "address" | "password" | "orders";
type MainSection = "account" | "orders";

export interface UserInfor {
  Username: string;
  password: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  birthday: string;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  isDefault: boolean;
}

const UserProfile = () => {
  const [activeMainSection, setActiveMainSection] =
    useState<MainSection>("account");
  const [activeSection, setActiveSection] = useState<Section>("profile");
  const [accountExpanded, setAccountExpanded] = useState(true);
  const { data: user, isLoading } = useQuery(getUser);

  // Refs for measuring submenu height
  const accountSubMenuRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    username: user?.username,
    password: "********",
    name: user?.fullName,
    email: user?.email,
    phone: user?.phone,
    gender: user?.gender,
  });

  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [isChangingPhone, setIsChangingPhone] = useState(false);
  const [isChangingBirthday, setIsChangingBirthday] = useState(false);
  const [newEmail, setNewEmail] = useState(formData.email);
  const [newPhone, setNewPhone] = useState(formData.phone);
  const [newBirthday, setNewBirthday] = useState(formData.birthDate);

  // For password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileImage, setProfileImage] = useState("/avatar_placeholder.png");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: mutateUpdateAccount } = useMutation(updateAccount);
  const { mutateAsync: mutateUpdateUser } = useMutation(updateUser);

  const { data: addressesResponse, refetch: refetchAddresses } = useQuery(
    listAddresses,
    {
      pagination: {
        page: 1,
        limit: 10,
      },
    }
  );

  const addresses = addressesResponse?.data ?? [];

  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);

  // Find default address
  useEffect(() => {
    const foundDefault = addresses.find((addr) => addr.isDefault);
    setDefaultAddress(foundDefault || null);
  }, [addresses]);

  useEffect(() => {
    setProfileImage(user?.avatar || "/avatar_placeholder.png");
    setFormData((prev) => ({
      ...prev,
      email: user?.email || "",
      phone: user?.phone || "",
      name: user?.fullName || "",
      gender: user?.gender || Gender.OTHER,
    }));
  }, [user]);

  // ẩn hiện số điện thoại
  const ShowHidePhone = ({ phoneNumber }) => {
    const [showPhone, setShowPhone] = useState(false);
    const togglePhoneVisibility = () => {
      setShowPhone((prev) => !prev);
    };

    const displayPhone = showPhone
      ? phoneNumber
      : phoneNumber.replace(/\d(?=\d{3})/g, "*");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenderChange = (value: number) => {
    setFormData((prev) => ({ ...prev, gender: value }));
  };

  const handleLogout = () => {
    // Chuyển hướng về trang đăng nhập (tuỳ thuộc vào router bạn đang dùng)
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const handleEmailChange = () => {
    if (isChangingEmail) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newEmail)) {
        alert("Please enter a valid email address");
        return;
      }

      // Update email in formData
      setFormData((prev) => ({ ...prev, email: newEmail }));
      setIsChangingEmail(false);
    } else {
      setIsChangingEmail(true);
    }
  };

  const handlePhoneChange = () => {
    if (isChangingPhone) {
      // Validate phone number (simple validation)
      if (newPhone && newPhone.length < 10) {
        alert("Please enter a valid phone number");
        return;
      }

      // Update phone in formData
      setFormData((prev) => ({ ...prev, phone: newPhone }));
      setIsChangingPhone(false);
    } else {
      setIsChangingPhone(true);
    }
  };

  const handleBirthdayChange = () => {
    if (isChangingBirthday) {
      // Update birthday in formData
      setFormData((prev) => ({ ...prev, birthDate: newBirthday }));
      setIsChangingBirthday(false);
    } else {
      setIsChangingBirthday(true);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    // Validate new password
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    // Validate password confirmation
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    try {
      // Update password
      await mutateUpdateAccount({
        id: user?.id,
        password: newPassword,
      });

      // Reset fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Show success message
      alert("Password updated successfully!");

      // Return to profile section
      setActiveSection("profile");
    } catch (error) {
      console.error("Error updating password:", error);
      setPasswordError("Failed to update password. Please try again.");
    }
  };

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    if (field === "current") {
      setShowCurrentPassword(!showCurrentPassword);
    } else if (field === "new") {
      setShowNewPassword(!showNewPassword);
    } else if (field === "confirm") {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Create a new tus upload
      const upload = new tus.Upload(file, {
        endpoint: `${BASE_URL}/files/`,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        metadata: {
          filename: file.name,
          filetype: file.type,
        },
        onError: (error) => {
          console.error("Failed to upload avatar:", error);
          alert("Failed to upload avatar. Please try again.");
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const percentage = Math.round((bytesUploaded / bytesTotal) * 100);
          console.log("Upload progress:", percentage + "%");
        },
        onSuccess: () => {
          if (upload.url) {
            setProfileImage(upload.url);
          }
        },
      });

      // Start the upload
      await upload.start();
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert("Failed to upload avatar. Please try again.");
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const navigateToChangePassword = () => {
    handleSubSectionClick("password");
  };

  const [hasChanges, setHasChanges] = useState(false);
  const [isNavigatingAway, setIsNavigatingAway] = useState(false);

  // Track form changes
  useEffect(() => {
    if (!user) return;

    const hasFormChanges =
      (formData.username !== undefined &&
        formData.username !== user.username) ||
      (formData.name !== undefined && formData.name !== user.fullName) ||
      (formData.email !== undefined && formData.email !== user.email) ||
      (formData.phone !== undefined && formData.phone !== user.phone) ||
      (formData.gender !== undefined && formData.gender !== user.gender) ||
      (profileImage !== undefined &&
        profileImage !== user.avatar &&
        profileImage !== "/avatar_placeholder.png") ||
      (defaultAddress?.id !== undefined &&
        defaultAddress.id.toString() !== user.defaultAddressId?.toString());

    setHasChanges(hasFormChanges);
  }, [formData, user, profileImage, defaultAddress]);

  // Handle navigation away with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);

  const handleSubSectionClick = (section: Section) => {
    if (hasChanges) {
      const confirm = window.confirm(
        "You have unsaved changes. Do you want to leave without saving?"
      );
      if (!confirm) return;
    }
    setActiveSection(section);
  };

  const handleMainSectionClick = (section: MainSection) => {
    if (hasChanges) {
      const confirm = window.confirm(
        "You have unsaved changes. Do you want to leave without saving?"
      );
      if (!confirm) return;
    }

    if (section === "account") {
      setAccountExpanded(!accountExpanded);
    }

    setActiveMainSection(section);
    if (section === "account") {
      setActiveSection("profile");
    } else {
      setActiveSection("orders");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const accountChanges: Record<string, any> = {
        id: user?.id,
      };

      // Only include avatar if it's changed from the default or previous value
      if (
        profileImage !== "/avatar_placeholder.png" &&
        profileImage !== user?.avatar
      ) {
        accountChanges.avatar = profileImage;
      }

      // Only include username if it's changed
      if (formData.username !== user?.username) {
        accountChanges.username = formData.username;
      }

      // Only include password if it was changed from the default asterisks
      if (formData.password !== "********") {
        accountChanges.password = formData.password;
      }

      // Only call mutateUpdateAccount if there are changes
      if (Object.keys(accountChanges).length > 1) {
        await mutateUpdateAccount(accountChanges);
      }

      const userChanges: Record<string, any> = {
        id: user?.id,
      };

      // Only include email if it's changed
      if (formData.email !== user?.email) {
        userChanges.email = formData.email;
      }

      // Only include phone if it's changed
      if (formData.phone !== user?.phone) {
        userChanges.phone = formData.phone;
      }

      // Only include fullName if it's changed
      if (formData.name !== user?.fullName) {
        userChanges.fullName = formData.name;
      }

      // Only include gender if it's changed
      if (formData.gender !== user?.gender) {
        userChanges.gender = formData.gender;
      }

      // Only include defaultAddressId if it exists and has changed
      if (defaultAddress?.id && defaultAddress.id !== user?.defaultAddressId) {
        userChanges.defaultAddressId = defaultAddress.id;
      }

      // Only call mutateUpdateUser if there are changes
      if (Object.keys(userChanges).length > 1) {
        await mutateUpdateUser(userChanges);
      }

      // Only show success message if any updates were made
      if (
        Object.keys(accountChanges).length > 1 ||
        Object.keys(userChanges).length > 1
      ) {
        alert("Profile updated successfully!");
        setHasChanges(false);
      } else {
        alert("No changes to update!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Left sidebar */}
      <div className="w-72 border-r bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center mb-8">
          <div
            className="relative h-24 w-24 mb-3 rounded-full overflow-hidden bg-gray-100 transition-all duration-300 hover:shadow-lg cursor-pointer group"
            onClick={triggerFileInput}
          >
            {isLoading ? (
              <div className="w-full h-full bg-gray-200 animate-pulse rounded-full" />
            ) : (
              <img
                src={profileImage || "/placeholder.jpeg"}
                alt="Profile"
                className="h-full w-full object-cover transition-all duration-300 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <User className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="text-base font-medium text-gray-800">
            {user?.fullName} ({user?.username})
          </div>
          <div className="text-sm text-gray-500">{user?.email}</div>
        </div>

        <nav className="space-y-2">
          {/* Account section with toggle */}
          <div
            className={`flex items-center justify-between p-3 cursor-pointer rounded-lg transition-all duration-200 ${
              activeMainSection === "account"
                ? "text-blue-600 bg-blue-50 font-medium"
                : "text-gray-600 hover:bg-gray-50"
            }`}
            onClick={() => handleMainSectionClick("account")}
          >
            <div className="flex items-center gap-3">
              <User className="h-5 w-5" />
              <span>My Account</span>
            </div>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-300 ${
                accountExpanded ? "rotate-180" : "rotate-0"
              }`}
            />
          </div>

          {/* Account submenu with smooth height animation */}
          <div
            ref={accountSubMenuRef}
            className="overflow-hidden transition-all duration-300 ease-in-out"
            style={{
              maxHeight: accountExpanded ? "200px" : "0px",
              opacity: accountExpanded ? 1 : 0,
              marginTop: accountExpanded ? "8px" : "0px",
            }}
          >
            <div className="pl-8 space-y-2">
              <div
                className={`p-3 cursor-pointer rounded-lg transition-all duration-200 ${
                  activeSection === "profile"
                    ? "text-blue-600 bg-blue-50 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => handleSubSectionClick("profile")}
              >
                Profile
              </div>
              <div
                className={`p-3 cursor-pointer rounded-lg transition-all duration-200 ${
                  activeSection === "address"
                    ? "text-blue-600 bg-blue-50 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => handleSubSectionClick("address")}
              >
                Address
              </div>
              <div
                className={`p-3 cursor-pointer rounded-lg transition-all duration-200 ${
                  activeSection === "password"
                    ? "text-blue-600 bg-blue-50 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => handleSubSectionClick("password")}
              >
                Change Password
              </div>
            </div>
          </div>

          {/* Orders section */}
          <div
            className={`flex items-center justify-between p-3 cursor-pointer rounded-lg transition-all duration-200 ${
              activeMainSection === "orders"
                ? "text-blue-600 bg-blue-50 font-medium"
                : "text-gray-600 hover:bg-gray-50"
            }`}
            onClick={() => handleMainSectionClick("orders")}
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-5 w-5" />
              <span>My Purchase</span>
            </div>
          </div>
        </nav>

        <hr className="my-4 border-gray-200" />

        <div
          className="flex items-center justify-between p-3 cursor-pointer rounded-lg transition-all duration-200 hover:bg-red-50 text-red-600"
          onClick={() => handleLogout()}
        >
          <div className="flex items-center gap-3">
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-8">
        {activeSection === "profile" && (
          <div className="bg-white rounded-xl shadow-sm transition-all duration-300 ease-in-out">
            <div className="p-8">
              <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-800">
                  My Profile
                </h1>
                <p className="text-gray-500 mt-1">
                  Manage your personal information and preferences
                </p>
              </div>

              <div className="border-t pt-8">
                <form onSubmit={handleSubmit} className="flex gap-12">
                  <div className="flex-1 space-y-6">
                    <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                      <label className="font-medium text-gray-700">
                        User Name
                      </label>
                      <div className="text-gray-800">{formData.username}</div>
                    </div>

                    <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                      <label className="font-medium text-gray-700">
                        Password
                      </label>
                      <div>
                        <button
                          type="button"
                          onClick={navigateToChangePassword}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
                        >
                          Change Password
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                      <label
                        htmlFor="name"
                        className="font-medium text-gray-700"
                      >
                        Full Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                      <label className="font-medium text-gray-700">Email</label>
                      <div className="flex items-center gap-3">
                        {isChangingEmail ? (
                          <>
                            <input
                              type="email"
                              value={newEmail}
                              onChange={(e) => setNewEmail(e.target.value)}
                              className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                              placeholder="Enter your email"
                            />
                            <button
                              type="button"
                              onClick={handleEmailChange}
                              className="px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsChangingEmail(false)}
                              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="text-gray-800">
                              {formData.email}
                            </span>
                            <button
                              type="button"
                              onClick={handleEmailChange}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
                            >
                              Change
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                      <label className="font-medium text-gray-700">
                        Phone Number
                      </label>
                      <div className="flex items-center gap-3">
                        {isChangingPhone ? (
                          <>
                            <input
                              type="tel"
                              value={newPhone}
                              onChange={(e) => setNewPhone(e.target.value)}
                              className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                              placeholder="Enter your phone number"
                            />
                            <button
                              type="button"
                              onClick={handlePhoneChange}
                              className="px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsChangingPhone(false)}
                              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="text-gray-800">
                              {formData.phone}
                            </span>
                            <button
                              type="button"
                              onClick={handlePhoneChange}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
                            >
                              Change
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                      <label className="font-medium text-gray-700">
                        Gender
                      </label>
                      <div className="flex gap-6">
                        {[Gender.MALE, Gender.FEMALE, Gender.OTHER].map(
                          (option) => (
                            <label
                              key={option}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <input
                                type="radio"
                                name="gender"
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 transition-colors duration-200"
                                defaultChecked={option == user?.gender}
                                onChange={() => handleGenderChange(option)}
                              />
                              <span className="text-gray-700">
                                {
                                  {
                                    [Gender.MALE]: "Male",
                                    [Gender.FEMALE]: "Female",
                                    [Gender.OTHER]: "Other",
                                  }[option]
                                }
                              </span>
                            </label>
                          )
                        )}
                      </div>
                    </div>

                    {/* Default Address */}
                    <div className="grid grid-cols-[180px_1fr] gap-4">
                      <label className="font-medium text-gray-700 pt-2">
                        Default Address
                      </label>
                      <div className="space-y-3">
                        {defaultAddress ? (
                          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-gray-800">
                                {defaultAddress.name}
                              </span>
                              <span className="text-gray-400">|</span>
                              <span className="text-gray-600">
                                {defaultAddress.phone}
                              </span>
                              <span className="bg-blue-100 text-blue-600 text-xs px-2.5 py-1 rounded-full ml-auto font-medium">
                                Default
                              </span>
                            </div>
                            <div className="text-gray-600 text-sm">
                              {defaultAddress.address}
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-500 italic">
                            No default address set
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleSubSectionClick("address")}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
                        >
                          Manage Addresses
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-[180px_1fr] items-center gap-4 pt-4">
                      <div></div>
                      <div className="flex items-center gap-3">
                        <button
                          type="submit"
                          disabled={!hasChanges}
                          className={`w-32 py-2.5 rounded-lg font-medium transition-colors duration-200 ${
                            hasChanges
                              ? "bg-blue-600 hover:bg-blue-700 text-white"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          Save Changes
                        </button>
                        {hasChanges && (
                          <span className="text-sm text-gray-500">
                            You have unsaved changes
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="w-48 flex flex-col items-center">
                    <div className="border-2 border-dashed border-gray-200 rounded-full h-32 w-32 flex items-center justify-center mb-4 hover:border-blue-300 transition-colors duration-200">
                      <div className="relative h-32 w-32 rounded-full overflow-hidden">
                        {isLoading ? (
                          <div className="w-full h-full bg-gray-200 animate-pulse rounded-full" />
                        ) : (
                          <img
                            src={profileImage || "/placeholder.svg"}
                            alt="Profile"
                            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity duration-300">
                          <User className="h-16 w-16 text-white" />
                        </div>
                      </div>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageSelect}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={triggerFileInput}
                      className="w-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
                    >
                      Choose Image
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {activeSection === "address" && (
          <AddressManagement
            addresses={addresses}
            refetchAddresses={refetchAddresses}
          />
        )}

        {activeSection === "password" && (
          <div className="bg-white rounded-xl shadow-sm transition-all duration-300 ease-in-out">
            <div className="p-8">
              <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-800">
                  Change Password
                </h1>
                <p className="text-gray-500 mt-1">
                  Keep your account secure by using a strong password
                </p>
              </div>

              <div className="border-t pt-8">
                <form
                  onSubmit={handlePasswordChange}
                  className="max-w-xl space-y-6"
                >
                  {passwordError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6">
                      {passwordError}
                    </div>
                  )}

                  <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                    <label
                      htmlFor="current-password"
                      className="font-medium text-gray-700"
                    >
                      Current password
                    </label>
                    <div className="relative">
                      <input
                        id="current-password"
                        placeholder="Enter your current password"
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("current")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                      >
                        {showCurrentPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                    <label
                      htmlFor="new-password"
                      className="font-medium text-gray-700"
                    >
                      New password
                    </label>
                    <div className="relative">
                      <input
                        id="new-password"
                        placeholder="Enter your new password"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("new")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                      >
                        {showNewPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                    <label
                      htmlFor="confirm-password"
                      className="font-medium text-gray-700"
                    >
                      Confirm password
                    </label>
                    <div className="relative">
                      <input
                        id="confirm-password"
                        placeholder="Confirm your new password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("confirm")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-[180px_1fr] items-center gap-4 pt-4">
                    <div></div>
                    <button
                      type="submit"
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors duration-200 whitespace-nowrap w-fit"
                    >
                      Update Password
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
  );
};

export default UserProfile;
