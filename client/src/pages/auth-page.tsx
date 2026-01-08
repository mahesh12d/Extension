import { useState, useEffect } from "react";
import { useLogin, useRegister, useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button, Input } from "@/components/ui-components";
import { Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [_, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast({
        title: "Validation Error",
        description: "Please enter both username and password",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isLogin) {
        await loginMutation.mutateAsync({ username, password });
        toast({ title: "Welcome back!", description: "Successfully logged in." });
      } else {
        await registerMutation.mutateAsync({ username, password });
        toast({ title: "Account created!", description: "Welcome to Autofill Pro." });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-xs space-y-8">
        <div className="text-center space-y-2">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto text-primary"
          >
            <Sparkles size={24} />
          </motion.div>
          <motion.h1 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-bold font-display tracking-tight"
          >
            {isLogin ? "Welcome back" : "Create account"}
          </motion.h1>
          <motion.p 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-muted-foreground"
          >
            {isLogin ? "Sign in to access your profiles" : "Start automating your form filling"}
          </motion.p>
        </div>

        <motion.form 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSubmit} 
          className="space-y-4"
        >
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="johndoe"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <div className="pt-2">
            <Button className="w-full" type="submit" isLoading={isLoading}>
              {isLogin ? "Sign In" : "Create Account"}
            </Button>
          </div>
        </motion.form>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-muted-foreground hover:text-primary transition-colors underline decoration-dotted"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
