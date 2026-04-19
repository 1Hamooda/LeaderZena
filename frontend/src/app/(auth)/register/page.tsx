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
import { register } from "@/services/authService";

export default function RegisterPage() {
  const router = useRouter();

  const [role,      setRole]      = useState<"member" | "volunteer">("member");
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [error,     setError]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [pending,   setPending]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await register({
        email,
        first_name: firstName,
        last_name:  lastName,
        role,
        password,
        password2:  password,
      });

      if (result.pending) {
        setPending(true);
        return;
      }

      router.push("/volunteer/dashboard");

    } catch (err: any) {
      const data = err?.response?.data;
      if (data) {
        const firstKey = Object.keys(data)[0];
        const raw = data[firstKey];
        const msg = Array.isArray(raw) ? raw[0] : raw;
        setError(typeof msg === "string" ? msg : "Registration failed. Please check your details.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  // Pending approval screen
  if (pending) {
    return (
      <PageWrapper>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f9fafb", padding: "24px" }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            style={{
              width: "100%",
              maxWidth: "440px",
              backgroundColor: "#ffffff",
              border: "1px solid #f0f0f0",
              borderRadius: "20px",
              padding: "48px 40px",
              textAlign: "center",
              boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              backgroundColor: "#f0f9f7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              fontSize: "1.75rem",
              color: "#2e8673",
              fontWeight: "700",
            }}>
              ✓
            </div>
            <h2 style={{ fontSize: "1.375rem", fontWeight: "800", color: "#0d0b08", margin: "0 0 12px" }}>
              Application submitted!
            </h2>
            <p style={{ fontSize: "0.9rem", color: "#6b7280", lineHeight: "1.7", margin: "0 0 32px" }}>
              Your member account is pending admin approval. You will be able to log in once an admin reviews your application.
            </p>
            <Link
              href="/login"
              style={{
                display: "inline-block",
                padding: "12px 32px",
                backgroundColor: "#2e8673",
                color: "#ffffff",
                borderRadius: "12px",
                fontWeight: "600",
                fontSize: "0.9rem",
                textDecoration: "none",
              }}
            >
              Back to Login
            </Link>
          </motion.div>
        </div>
      </PageWrapper>
    );
  }

  // Registration form
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
            Join <span style={{ color: "#66bdab" }}>MENA</span> Club
          </h2>
          <p style={{ color: "#b2ddd5", fontSize: "1rem", marginTop: "12px", textAlign: "center", maxWidth: "320px", lineHeight: "1.6" }}>
            Be part of a growing community of youth leaders across the Middle East and North Africa.
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
            overflowY: "auto",
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
              <h1 style={{ fontSize: "1.75rem", fontWeight: "800", marginBottom: "8px" }}>
                Join <span style={{ color: "#2e8673" }}>MENA</span> Club
              </h1>
              <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Create your account</p>
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <AnimatedInput
                  label="First Name"
                  placeholder="Ahmad"
                  value={firstName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
                  required
                />
                <AnimatedInput
                  label="Last Name"
                  placeholder="Tarek"
                  value={lastName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
                  required
                />
              </div>

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

              {/* Role Selector */}
              <div>
                <label style={{ fontSize: "0.875rem", fontWeight: "500", color: "#374151", display: "block", marginBottom: "10px" }}>
                  I want to join as
                </label>
                <div style={{ display: "flex", gap: "12px" }}>
                  {(["member", "volunteer"] as const).map((r) => (
                    <motion.button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      style={{
                        flex: 1,
                        padding: "16px",
                        textAlign: "center",
                        borderRadius: "12px",
                        cursor: "pointer",
                        border: role === r ? "2px solid #2e8673" : "2px solid #e5e7eb",
                        backgroundColor: role === r ? "#f0f9f7" : "#ffffff",
                        transition: "border 0.2s, background-color 0.2s",
                      }}
                    >
                      <p style={{ fontWeight: "600", fontSize: "0.875rem", marginBottom: "2px", color: role === r ? "#2e8673" : "#0d0b08" }}>
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </p>
                      <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0 }}>
                        {r === "member" ? "Join events and grow" : "Help and contribute"}
                      </p>
                    </motion.button>
                  ))}
                </div>

                {role === "member" && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      marginTop: "10px",
                      fontSize: "0.75rem",
                      color: "#9ca3af",
                      backgroundColor: "#f9fafb",
                      padding: "8px 12px",
                      borderRadius: "8px",
                    }}
                  >
                    Member accounts require admin approval before you can log in.
                  </motion.p>
                )}
              </div>

              <AnimatedButton
                variant="primary"
                fullWidth
                type="submit"
                disabled={loading}
                style={{ padding: "14px", fontSize: "1rem", marginTop: "4px" }}
              >
                {loading ? "Creating account..." : "Create Account"}
              </AnimatedButton>
            </motion.form>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              style={{ textAlign: "center", fontSize: "0.875rem", color: "#6b7280", marginTop: "28px" }}
            >
              Already have an account?{" "}
              <Link href="/login" style={{ color: "#2e8673", fontWeight: "500" }}>Sign in</Link>
            </motion.p>

          </div>
        </div>
      </div>
    </PageWrapper>
  );
}