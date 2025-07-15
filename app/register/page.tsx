import { AuthForm } from '@/components/AuthForm'
import { Navigation } from '@/components/Navigation'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-16">
        <AuthForm mode="register" />
      </div>
    </div>
  )
}