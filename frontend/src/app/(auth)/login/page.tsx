"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Player } from "@lottiefiles/react-lottie-player";
import { motion } from "framer-motion";
import AnimatedButton from "@/components/ui/AnimatedButton";
import AnimatedInput from "@/components/ui/AnimatedInput";
import PageWrapper from "@/components/ui/PageWrapper";
import { login } from "@/services/authService";

export default function LoginPage() {
  const router = useRouter();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user } = await login({ email, password });
      if (user.role === "admin")          router.push("/admin/dashboard");
      else if (user.role === "volunteer") router.push("/volunteer/dashboard");
      else                                router.push("/member/dashboard");
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageWrapper>
      <div style={{ display: "flex", minHeight: "100vh" }}>

        {/* Left Side */}
        <div
          style={{
            flex: 1,
            background: "linear-gradient(135deg, #2e8673 0%, #211f21 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "64px",
          }}
          className="hidden md:flex"
        >
          <Player autoplay loop src="/animation.json" style={{ width: "380px", height: "380px" }} />
          <h2 style={{ color: "#ffffff", fontSize: "1.75rem", fontWeight: "700", marginTop: "32px", textAlign: "center" }}>
            Welcome to <span style={{ color: "#66bdab" }}>MENA</span> Club
          </h2>
          <p style={{ color: "#b2ddd5", fontSize: "1rem", marginTop: "12px", textAlign: "center", maxWidth: "320px", lineHeight: "1.6" }}>
            Empowering youth across the Middle East and North Africa through volunteering and community.
          </p>
        </div>

        {/* Right Side */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "64px 80px",
            backgroundColor: "#ffffff",
          }}
        >
          <div style={{ width: "100%", maxWidth: "420px" }}>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              style={{ textAlign: "center", marginBottom: "40px" }}
            >
              <Image src="/logo.png" alt="MENA Club" width={56} height={56} quality={100} unoptimized className="h-14 w-auto mx-auto mb-4" />
              <h1 style={{ fontSize: "1.75rem", fontWeight: "800", marginBottom: "8px" }}>Welcome Back</h1>
              <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Sign in to your account</p>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "10px",
                  padding: "12px 16px",
                  marginBottom: "20px",
                  fontSize: "0.875rem",
                  color: "#dc2626",
                }}
              >
                {error}
              </motion.div>
            )}

            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <AnimatedInput
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
              />
              <AnimatedInput
                label="Password"
                type="password"
                placeholder="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required
              />

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.875rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", color: "#6b7280" }}>
                  <input type="checkbox" /> Remember me
                </label>
                <motion.a href="#" whileHover={{ color: "#469d8b" }} style={{ color: "#2e8673", textDecoration: "none" }}>
                  Forgot password?
                </motion.a>
              </div>

              <AnimatedButton
                variant="primary"
                fullWidth
                type="submit"
                disabled={loading}
                style={{ padding: "14px", fontSize: "1rem", marginTop: "4px" }}
              >
                {loading ? "Signing in..." : "Sign In"}
              </AnimatedButton>
            </motion.form>

            <motion.p
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 0.35, duration: 0.4 }}
  style={{ textAlign: "center", fontSize: "0.875rem", color: "#6b7280", marginTop: "28px" }}
>
  Already have an account?{" "}
  <Link href="/register" style={{ color: "#2e8673", fontWeight: "500" }}>Sign up</Link>
</motion.p>

          </div>
        </div>
      </div>
    </PageWrapper>
  );
}