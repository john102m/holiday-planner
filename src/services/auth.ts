import {jwtDecode} from "jwt-decode";

// 🛡️ Why Use a Strict CSP?
// A strict CSP goes beyond basic restrictions. It:
// Blocks inline scripts (like <script>alert('XSS')</script>)
// Disallows eval() and similar risky functions
// Requires nonces or hashes for scripts/styles
// Prevents loading from untrusted domains
// This makes it extremely hard for attackers to inject malicious code—even if they find a vulnerability.
// 🧪 Example Strict CSP Header
// http
// Content-Security-Policy:
//   default-src 'none';
//   script-src 'self' 'nonce-abc123';
//   style-src 'self' 'nonce-def456';
//   img-src 'self' https://trusted.cdn.com;
//   frame-ancestors 'none';
// 'self' allows resources from your own domain.
// 'nonce-abc123' allows only scripts with a matching nonce.
// frame-ancestors 'none' blocks clickjacking via iframes.
// 🧰 Tools & Resources
// MDN’s CSP Guide explains how to craft and deploy policies.
// OWASP Cheat Sheet offers best practices for defense-in-depth.
// Web.dev’s strict CSP article shows how to use nonces and hashes effectively.



export interface MyJwtPayload {
  sub: string;
  email: string;
  role: string;
  app_metadata?: {
    role?: string;
    roles?: string[];
    provider?: string;
    providers?: string[];
  };
  user_metadata?: {
    email_verified?: boolean;
  };
  exp: number;
  iat: number;
}

export function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

export function getAccessToken(): string | null {
  return localStorage.getItem("access_token");
}

export function isLoggedIn(): boolean {
  const token = getAccessToken();
  return !!token && !isTokenExpired();
}

export function hasRole(role: string): boolean {
  const decoded = decodeToken();
  return (
    decoded?.app_metadata?.role === role ||
    decoded?.app_metadata?.roles?.includes(role) ||
    false
  );
}

export function getRefreshToken(): string | null {
  return localStorage.getItem("refresh_token");
}

export function decodeToken(): MyJwtPayload | null {
  const token = getAccessToken();
  if (!token) return null;
  return jwtDecode<MyJwtPayload>(token);
}

export function isTokenExpired(): boolean {
  const decoded = decodeToken();
  if (!decoded) return true;

  const now = Math.floor(Date.now() / 1000);
  return decoded.exp < now;
}

export function getUserRole(): string | undefined {
  const decoded = decodeToken();
  return decoded?.app_metadata?.role;
}

export function isAdmin(): boolean {
  const decoded = decodeToken();
  return (
    decoded?.app_metadata?.role === "admin" ||
    decoded?.app_metadata?.roles?.includes("admin") ||
    false // fallback to ensure boolean
  );
}

export function getUserId(): string | null {
  const decoded = decodeToken();
  return decoded?.sub ?? null;
}

export function getUserEmail(): string | null {
  const decoded = decodeToken();
  return decoded?.email ?? null;
}

export function inspectRoles() {
  const token = getAccessToken();
  if (!token) {
    console.warn("No access token found.");
    return;
  }

  const decoded = jwtDecode<MyJwtPayload>(token);
  console.log("Decoded JWT:", decoded);
  console.log("User role:", decoded.role);
  console.log("User email:", decoded.email);
  console.log("User ID:", decoded.sub);

  const appRole = decoded.app_metadata?.role;
  const appRoles = decoded.app_metadata?.roles;

  console.log("App Metadata Role:", appRole);
  console.log("App Metadata Roles:", appRoles);
}

