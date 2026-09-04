"use client";

import { Alert, Button, Stack, TextField } from "@mui/material";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const safeReturnTo = (value: string | null) => value?.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";

export default function LoginForm({ returnTo }: { returnTo?: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/sign-in/username", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.get("username"), password: form.get("password"), rememberMe: true }),
      });
      if (!response.ok) throw new Error("invalid");
      router.replace(safeReturnTo(returnTo ?? null));
      router.refresh();
    } catch {
      setError("The username or password is incorrect.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <Stack spacing={2.25}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField autoComplete="username" fullWidth label="Username" name="username" required slotProps={{ htmlInput: { minLength: 3, maxLength: 30 } }} />
        <TextField autoComplete="current-password" fullWidth label="Password" name="password" required type="password" slotProps={{ htmlInput: { minLength: 12, maxLength: 128 } }} />
        <Button disabled={loading} fullWidth size="large" type="submit" variant="contained">{loading ? "Signing in…" : "Sign in"}</Button>
      </Stack>
    </form>
  );
}
