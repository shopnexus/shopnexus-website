import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Checkbox from "../../components/ui/Checkbox";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import { loginAdmin } from "shopnexus-protobuf-gen-ts";
import { useMutation } from "@connectrpc/connect-query";

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { mutateAsync: mutateLoginAdmin } = useMutation(loginAdmin);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const data = await mutateLoginAdmin({
        username: username,
        password: password,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("isAdmin", "true");

      window.location.href = "/admin";
    } catch (err: any) {
      let errorMessage = "An error occurred during login";

      switch (err.code) {
        case "auth/user-disabled":
          errorMessage = "This account has been disabled";
          break;
        case "auth/user-not-found":
          errorMessage = "No account found with this username";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password";
          break;
        default:
          errorMessage = "Invalid admin credentials";
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h2 className="text-2xl font-bold text-center">Admin Login</h2>
        </CardHeader>
        <CardBody>
          {error && (
            <div
              className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg"
              role="alert"
            >
              {error}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Admin Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={isLoading}
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              required
            />
            <div className="flex items-center justify-between">
              <Checkbox
                label="Remember me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
                className="cursor-pointer"
              />
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-blue-600 hover:underline cursor-pointer"
                disabled={isLoading}
              >
                Forgot password?
              </button>
            </div>
            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login as Admin"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600">
            Not an admin?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-blue-600 hover:underline cursor-pointer"
              disabled={isLoading}
            >
              Regular Login
            </button>
          </p>
        </CardBody>
      </Card>
    </div>
  );
};

export default AdminLogin;
