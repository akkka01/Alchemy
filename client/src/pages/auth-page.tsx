import { useState } from "react";
import { Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one symbol"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const { user, loginMutation, registerMutation, isLoading } = useAuth();
  const { toast } = useToast();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onLoginSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  // Redirect if user is already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50">
      <div className="max-w-md w-full space-y-8">
        <Card className="shadow-xl rounded-xl overflow-hidden border-t-4 border-t-primary-500">
          <CardContent className="p-6 sm:p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-3">
                <div className="bg-gradient-to-br from-primary-500 to-accent-500 p-4 rounded-2xl shadow-lg">
                  <i className="ri-flask-fill text-4xl text-white"></i>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-primary-600 mb-2">ALCHEMY</h1>
              <p className="text-gray-600 text-lg">Transform your coding journey</p>
            </div>

            {/* Auth Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setAuthTab("login")}
                className={`flex-1 py-3 text-center border-b-2 focus:outline-none transition ${
                  authTab === "login" 
                    ? "border-primary-500 text-primary-600 font-medium" 
                    : "border-transparent text-gray-500"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setAuthTab("register")}
                className={`flex-1 py-3 text-center border-b-2 focus:outline-none transition ${
                  authTab === "register" 
                    ? "border-primary-500 text-primary-600 font-medium" 
                    : "border-transparent text-gray-500"
                }`}
              >
                Register
              </button>
            </div>

            {/* Login Form */}
            {authTab === "login" && (
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                        <div className="flex justify-end mt-1">
                          <a href="#" className="text-xs text-primary-600 hover:text-primary-500">
                            Forgot password?
                          </a>
                        </div>
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full bg-primary-600 hover:bg-primary-700 transition-all duration-300" 
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </Form>
            )}

            {/* Register Form */}
            {authTab === "register" && (
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-5">
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                        <div className="mt-1 text-xs text-gray-500">
                          Must be at least 8 characters with a number and symbol
                        </div>
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full bg-primary-600 hover:bg-primary-700 transition-all duration-300" 
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </Form>
            )}

            {/* Social Login */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button variant="outline" className="w-full hover:bg-slate-100 border-gray-300 transition-all duration-300">
                  <i className="ri-github-fill text-xl mr-2 text-slate-800"></i>
                  GitHub
                </Button>
                <Button variant="outline" className="w-full hover:bg-red-50 border-gray-300 transition-all duration-300">
                  <i className="ri-google-fill text-xl mr-2 text-red-500"></i>
                  Google
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
