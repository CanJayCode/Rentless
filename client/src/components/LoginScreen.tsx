import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound, User, ArrowRight, Lock } from "lucide-react";

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate loading animation
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (name.toLowerCase().trim() === "sachin") {
      setShowWelcome(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      onLogin();
    } else {
      setError("Invalid name. Please try again.");
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.2
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: { duration: 0.4 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const logoVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: { 
        duration: 0.8, 
        ease: "easeOut",
        type: "spring",
        bounce: 0.4
      }
    }
  };

  const welcomeVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.3
      }
    }
  };

  const sparkleVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: [0, 1.2, 1], 
      opacity: [0, 1, 0.8],
      transition: { 
        duration: 1,
        ease: "easeOut",
        repeat: Infinity,
        repeatType: "reverse"
      }
    }
  };

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center p-4">
        <motion.div
          variants={welcomeVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          <motion.div
            variants={itemVariants}
            className="relative mb-8"
          >
            <motion.div
              variants={sparkleVariants}
              className="absolute -top-4 -left-4 w-8 h-8 bg-yellow-400 rounded-full"
            />
            <motion.div
              variants={sparkleVariants}
              style={{ animationDelay: "0.5s" }}
              className="absolute -top-2 -right-6 w-6 h-6 bg-pink-400 rounded-full"
            />
            <motion.div
              variants={sparkleVariants}
              style={{ animationDelay: "1s" }}
              className="absolute -bottom-4 left-8 w-4 h-4 bg-green-400 rounded-full"
            />
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome, Sachin!
            </h1>
          </motion.div>
          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-600 dark:text-gray-300 mb-8"
          >
            Loading your Room Management System...
          </motion.p>
          <motion.div
            variants={itemVariants}
            className="flex justify-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
            />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center p-4">
      <AnimatePresence>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="w-full max-w-md"
        >
          <motion.div variants={itemVariants} className="text-center mb-8">
            <motion.div
              variants={logoVariants}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-2xl"
            >
              <Lock className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Room Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Enter your name to access the system
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
              <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-semibold">Access Portal</CardTitle>
                <CardDescription>
                  Please enter your name to continue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Your Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your name..."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-12 text-lg"
                      autoFocus
                      required
                    />
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-red-500 text-sm flex items-center gap-2"
                    >
                      <KeyRound className="w-4 h-4" />
                      {error}
                    </motion.div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                    disabled={isLoading || !name.trim()}
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                    ) : (
                      <ArrowRight className="w-5 h-5 mr-2" />
                    )}
                    {isLoading ? "Authenticating..." : "Enter System"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-8 text-center"
          >
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Lock className="w-4 h-4" />
              Secure access portal
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}