import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { LoginForm } from './login-form'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; error?: string }>
}) {
  const user = await getCurrentUser()
  if (user) redirect('/')

  const { redirectTo, error } = await searchParams
  return <LoginForm redirectTo={redirectTo} accountDisabled={error === 'account_disabled'} />
}
