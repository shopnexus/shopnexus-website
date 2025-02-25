"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { User } from "firebase/auth"
import { getCurrentUser } from "./firebase"
import Login from "./Login_Resigter/Login"
import Register from "./Login_Resigter/Register"
import Dashboard from "./DashBoard"

type AuthState = "login" | "register" | "dashboard"

const AuthWrapper: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>("login")
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      setAuthState(currentUser ? "dashboard" : "login")
    }
    checkUser()
  }, [])

  const handleAuthStateChange = (newState: AuthState) => {
    setAuthState(newState)
  }

  if (authState === "dashboard" && user) {
    return <Dashboard />
  }

  if (authState === "register") {
    return (
      <>
        <Register />
        <p className="text-center mt-4">
          Đã có tài khoản?{" "}
          <button onClick={() => handleAuthStateChange("login")} className="text-blue-600 hover:underline">
            Đăng nhập
          </button>
        </p>
      </>
    )
  }

  return (
    <>
      <Login />
      <p className="text-center mt-4">
        Chưa có tài khoản?{" "}
        <button onClick={() => handleAuthStateChange("register")} className="text-blue-600 hover:underline">
          Đăng ký
        </button>
      </p>
    </>
  )
}

export default AuthWrapper

