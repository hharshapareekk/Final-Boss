"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// A simple function to set a cookie.
function setCookie(name: string, value: string, days: number) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function deleteCookie(name: string) {
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const router = useRouter();

  // Check if already logged in as admin
  const isAdmin = typeof document !== 'undefined' && document.cookie.includes('isAdmin=true');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you'd have proper authentication.
    // For now, we'll use a simple hardcoded password.
    if (password === "admin") {
      setCookie("isAdmin", "true", 7); // Set a cookie that expires in 7 days
      router.push("/admin");
    } else {
      alert("Incorrect password");
    }
  };

  const handleLogout = () => {
    deleteCookie("isAdmin");
    router.push("/login");
  };

  if (isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
        <div className="w-full max-w-md rounded-lg bg-gray-800 p-8 shadow-lg text-center">
          <h2 className="mb-6 text-3xl font-bold">You are already logged in as Admin</h2>
          <button onClick={handleLogout} className="mt-4 w-full rounded-md bg-red-600 py-3 font-semibold text-white shadow-md transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800">Logout</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-md rounded-lg bg-gray-800 p-8 shadow-lg">
        <h2 className="mb-6 text-center text-3xl font-bold">Admin Login</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 p-3 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-indigo-600 py-3 font-semibold text-white shadow-md transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
} 