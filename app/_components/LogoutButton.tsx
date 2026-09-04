"use client";

import { Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return (
    <Button
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await fetch("/api/auth/sign-out", {
          body: JSON.stringify({}),
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          method: "POST",
        });
        router.replace("/login");
        router.refresh();
      }}
      size="small"
      variant="outlined"
    >
      {loading ? "Signing out…" : "Sign out"}
    </Button>
  );
}
