import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Checkbox from "../../components/ui/Checkbox";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import { getUser, loginUser } from "shopnexus-protobuf-gen-ts";
import { useMutation, useQuery } from "@connectrpc/connect-query";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { mutateAsync: mutateLoginUser } = useMutation(loginUser);

  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, user } = useAuth();
  const { refetch: refetchUser } = useQuery(getUser);

  useEffect(() => {
    if (user) {
      const redirectPath = localStorage.getItem("redirectAfterLogin");
      if (redirectPath) {
        localStorage.removeItem("redirectAfterLogin");
        navigate(redirectPath);
      } else {
        navigate("/");
      }
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const data = await mutateLoginUser({
        username: email,
        password: password,
      });

      localStorage.setItem("token", data.token);
      const from = location.state?.from?.pathname || (isAdmin ? "/admin" : "/");
      refetchUser();
      navigate(from, { replace: true });

      // await signInWithEmailAndPassword(auth, email, password)
    } catch (err: any) {
      let errorMessage = "An error occurred during login";

      switch (err.code) {
        case "auth/invalid-email":
          errorMessage = "Invalid email address";
          break;
        case "auth/user-disabled":
          errorMessage = "This account has been disabled";
          break;
        case "auth/user-not-found":
          errorMessage = "No account found with this email";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password";
          break;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const isAdminEmail = result.user.email?.endsWith("@shopnexus.com");
      const from =
        location.state?.from?.pathname || (isAdminEmail ? "/admin" : "/");
      navigate(from, { replace: true });
    } catch (err: any) {
      setError("Failed to sign in with Google");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h2 className="text-2xl font-bold text-center">Login</h2>
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
              label="Email or Username"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
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
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>

          {/* <div className="relative mt-6">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t border-gray-300" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-white px-2 text-gray-500">
								Or continue with
							</span>
						</div>
					</div> */}

          {/* <Button
						variant="outline"
						className="mt-4 w-full cursor-pointer"
						onClick={handleGoogleLogin}
						disabled={isLoading}
					>
						<svg className="w-5 h-5 mr-2 inline-block " viewBox="0 0 24 24">
							<path
								fill="#4285F4"
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
							/>
							<path
								fill="#34A853"
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
							/>
							<path
								fill="#FBBC05"
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
							/>
							<path
								fill="#EA4335"
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
							/>
							<path d="M1 1h22v22H1z" fill="none" />
						</svg>
						Sign in with Google
					</Button> */}

          <p className="mt-4 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-blue-600 hover:underline cursor-pointer"
              disabled={isLoading}
            >
              Register
            </button>
          </p>
          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>
          {/* create button redirect login admin here */}
          <Button
            variant="outline"
            className="mt-4 w-full cursor-pointer"
            onClick={() => navigate("/admin-login")}
            disabled={isLoading}
          >
            Login as Admin
          </Button>
        </CardBody>
      </Card>
    </div>
  );
};

export default Login;
