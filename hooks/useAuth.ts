"use client"

import { useCallback } from "react"
import { logout } from "@/lib/auth-actions"
import type { UserProfile } from "@/types"

/**
 * Hook for authentication operations
 * Provides logout and permission checking utilities
 */
export function useAuth(user: UserProfile | null) {
  const handleLogout = useCallback(async () => {
    try {
      await logout()
    } catch (error) {
      console.error("[Auth] Logout error:", error)
      throw error
    }
  }, [])

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user) return false
      return user.permissions.includes(permission)
    },
    [user]
  )

  const hasAnyPermission = useCallback(
    (permissions: string[]): boolean => {
      if (!user) return false
      return permissions.some(p => user.permissions.includes(p))
    },
    [user]
  )

  const hasAllPermissions = useCallback(
    (permissions: string[]): boolean => {
      if (!user) return false
      return permissions.every(p => user.permissions.includes(p))
    },
    [user]
  )

  const canAccess = useCallback(
    (roles: string[], permissions?: string[]): boolean => {
      if (!user || !roles.includes(user.role)) return false
      if (!permissions) return true
      return permissions.some(p => user.permissions.includes(p))
    },
    [user]
  )

  return {
    user,
    handleLogout,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccess,
    isAuthenticated: !!user,
  }
}
