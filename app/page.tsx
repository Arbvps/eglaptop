import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { DashboardClient } from "@/components/dashboard-client"

export default async function Home() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (!user.is_active) redirect("/login?error=account_disabled")
  return <DashboardClient user={user} />
}
