"use client"

import type React from "react"
import { signOut } from "firebase/auth"
import { auth } from "./firebase"
import Button from "../components/ui/Button"
import Card, { CardHeader, CardBody } from "../components/ui/Card"

const Dashboard: React.FC = () => {
  const handleSignOut = async () => {
    try {
      await signOut(auth)
      // Đăng xuất thành công, cập nhật UI hoặc chuyển hướng người dùng
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </CardHeader>
        <CardBody>
          <p className="mb-4">Chào mừng bạn đã đăng nhập thành công!</p>
          <Button onClick={handleSignOut}>Đăng xuất</Button>
        </CardBody>
      </Card>
    </div>
  )
}

export default Dashboard

