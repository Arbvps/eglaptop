"use client"

import useSWR from "swr"
import { useCallback, useMemo } from "react"
import type { Sale, SalesMetrics } from "@/types"

/**
 * Hook for dashboard data calculations and metrics
 * Provides common aggregations and filters for dashboard display
 */
export function useDashboardData(sales: Sale[]) {
  // ─── Calculate Metrics ───────────────────────────────────────────────────────
  const metrics = useMemo<SalesMetrics>(() => {
    if (sales.length === 0) {
      return {
        totalSales: 0,
        totalQuantity: 0,
        averageDealSize: 0,
        conversionRate: 0,
      }
    }

    const totalSales = sales.reduce((sum, sale) => sum + sale.amount, 0)
    const totalQuantity = sales.reduce((sum, sale) => sum + sale.quantity, 0)
    const averageDealSize = totalSales / sales.length
    const completedCount = sales.filter(s => s.status === "completed").length
    const conversionRate = (completedCount / sales.length) * 100

    return {
      totalSales,
      totalQuantity,
      averageDealSize,
      conversionRate,
    }
  }, [sales])

  // ─── Group Sales by Period ──────────────────────────────────────────────────
  const salesByDate = useMemo(() => {
    const grouped: Record<string, Sale[]> = {}
    sales.forEach(sale => {
      if (!grouped[sale.date]) {
        grouped[sale.date] = []
      }
      grouped[sale.date].push(sale)
    })
    return grouped
  }, [sales])

  // ─── Group Sales by Salesperson ─────────────────────────────────────────────
  const salesBySalesperson = useMemo(() => {
    const grouped: Record<string, Sale[]> = {}
    sales.forEach(sale => {
      if (!grouped[sale.salesperson]) {
        grouped[sale.salesperson] = []
      }
      grouped[sale.salesperson].push(sale)
    })
    return grouped
  }, [sales])

  // ─── Get Top Performers ─────────────────────────────────────────────────────
  const topPerformers = useMemo(() => {
    const performers = Object.entries(salesBySalesperson).map(([name, items]) => ({
      name,
      totalSales: items.reduce((sum, s) => sum + s.amount, 0),
      dealCount: items.length,
      completedDeals: items.filter(s => s.status === "completed").length,
    }))
    return performers.sort((a, b) => b.totalSales - a.totalSales)
  }, [salesBySalesperson])

  // ─── Get Sales by Status ────────────────────────────────────────────────────
  const salesByStatus = useMemo(() => {
    return {
      completed: sales.filter(s => s.status === "completed").length,
      pending: sales.filter(s => s.status === "pending").length,
      cancelled: sales.filter(s => s.status === "cancelled").length,
    }
  }, [sales])

  // ─── Filter Sales ───────────────────────────────────────────────────────────
  const filterSales = useCallback(
    (filters: {
      search?: string
      status?: string
      salesperson?: string
      dateRange?: { from: string; to: string }
    }) => {
      return sales.filter(sale => {
        // Search filter
        if (filters.search) {
          const searchLower = filters.search.toLowerCase()
          const matchesSearch =
            sale.customerName.toLowerCase().includes(searchLower) ||
            sale.course.toLowerCase().includes(searchLower) ||
            sale.salesperson.toLowerCase().includes(searchLower)
          if (!matchesSearch) return false
        }

        // Status filter
        if (filters.status && filters.status !== "all" && sale.status !== filters.status) {
          return false
        }

        // Salesperson filter
        if (
          filters.salesperson &&
          filters.salesperson !== "all" &&
          sale.salesperson !== filters.salesperson
        ) {
          return false
        }

        // Date range filter
        if (filters.dateRange) {
          const saleDate = new Date(sale.date).getTime()
          const fromDate = new Date(filters.dateRange.from).getTime()
          const toDate = new Date(filters.dateRange.to).getTime()
          if (saleDate < fromDate || saleDate > toDate) return false
        }

        return true
      })
    },
    [sales]
  )

  return {
    metrics,
    salesByDate,
    salesBySalesperson,
    topPerformers,
    salesByStatus,
    filterSales,
  }
}

/**
 * Hook for fetching data with error handling and loading states
 */
export function useFetch<T>(url: string, options?: Record<string, unknown>) {
  const { data, error, isLoading, mutate } = useSWR<T>(
    url,
    async (url: string) => {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`)
      }
      return response.json()
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
      ...options,
    }
  )

  return {
    data,
    error: error?.message || null,
    isLoading,
    mutate,
  }
}
