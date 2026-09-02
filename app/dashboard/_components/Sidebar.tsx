"use client";

import { Box, ButtonBase, Typography } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Overview", mark: "O" },
  { href: "/dashboard/offers", label: "Offers", mark: "P" },
  { href: "/dashboard/analytics", label: "Analytics", mark: "A" },
] as const;

const isActiveRoute = (pathname: string | null, href: string) =>
  href === "/dashboard" ? pathname === href : Boolean(pathname?.startsWith(href));

const Sidebar = () => {
	const pathname = usePathname();

	return (
		<Box
			component="nav"
			aria-label="Dashboard"
			sx={{
				display: { xs: "grid", md: "flex" },
				flexDirection: { md: "column" },
				gap: 1,
				gridTemplateColumns: { xs: "repeat(3, minmax(0, 1fr))" },
				p: { xs: 1.25, md: 2 },
			}}
		>
			{navItems.map((item) => {
				const isActive = isActiveRoute(pathname, item.href);

				return (
					<ButtonBase
						aria-current={isActive ? "page" : undefined}
						component={Link}
						href={item.href}
						key={item.href}
						sx={{
							borderRadius: 2.5,
							color: isActive ? "primary.dark" : "text.secondary",
							gap: { xs: 0.5, md: 1.25 },
							justifyContent: { xs: "center", md: "flex-start" },
							minHeight: 48,
							px: { xs: 1, md: 1.5 },
							textDecoration: "none",
							...(isActive && {
								bgcolor: "#eff6ff",
								boxShadow: "inset 0 0 0 1px rgba(37, 99, 235, 0.08)",
							}),
							"&:hover": { bgcolor: isActive ? "#eff6ff" : "#f8fafc" },
							"&:focus-visible": {
								outline: "3px solid rgba(37, 99, 235, 0.22)",
								outlineOffset: 1,
							},
						}}
					>
						<Box
							aria-hidden="true"
							sx={{
								alignItems: "center",
								bgcolor: isActive ? "#dbeafe" : "#f2f4f7",
								borderRadius: 1.5,
								display: { xs: "none", sm: "flex" },
								fontSize: "0.72rem",
								fontWeight: 800,
								height: 28,
								justifyContent: "center",
								width: 28,
							}}
						>
							{item.mark}
						</Box>
						<Typography component="span" sx={{ fontSize: "0.9rem", fontWeight: isActive ? 750 : 650 }}>
							{item.label}
						</Typography>
					</ButtonBase>
				);
			})}
		</Box>
	)
}

export default Sidebar;
