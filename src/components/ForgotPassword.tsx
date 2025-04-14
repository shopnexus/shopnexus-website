import { Link } from "react-router-dom"

import Button from "./ui/Button"
import Input from "./ui/Input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/Card"

import { useState } from "react";

export function ForgotPassword() {
  const [email, setEmail] = useState("");

  return (
    <Card className="w-full max-w-md mx-auto flex justify-center items-center flex-col border rounded-lg shadow-md">
      <CardHeader className="text-center ">
        <CardTitle className="text-2xl">Forgot Password</CardTitle>
        <CardDescription>
          Enter your email address and we&apos;ll send you a link to reset your password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">We&apos;ll send a password reset link to this email.</p>
          </div>
          <Button className="secondary w-full" variant="primary" onClick={()=>{
            alert(`Password reset link sent to ${email}`)
          }}>Send Reset Link</Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center border-t pt-4">
        <Button className="secondary" variant="primary">
          <Link to="/login">Back to login</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
