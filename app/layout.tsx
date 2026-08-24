import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "36Stories Feedback",
  description: "A persisted feedback foundation for 36Stories",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
