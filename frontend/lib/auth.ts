"use client"

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  return !!localStorage.getItem("token")
}

export function getUserEmail(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("userEmail")
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token")
}

export function logout() {
  if (typeof window === "undefined") return
  localStorage.removeItem("token")
  localStorage.removeItem("userEmail")
}