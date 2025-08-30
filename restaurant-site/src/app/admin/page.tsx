import { getCurrentUser } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'

export default async function AdminDashboard() {
  const user = await getCurrentUser()

  if (!user || user.role !== 'admin') {
    redirect('/admin/login')
  }

  return (
    <div className=\"min-h-screen bg-gray-50 p-8\">
      <div className=\"max-w-7xl mx-auto\">
        <div className=\"bg-white shadow rounded-lg p-6\">
          <h1 className=\"text-2xl font-bold text-gray-900 mb-4\">
            Admin Dashboard
          </h1>
          <p className=\"text-gray-600 mb-4\">
            Welcome back, {user.name || user.email}!
          </p>
          <div className=\"bg-green-50 border border-green-200 rounded-md p-4\">
            <p className=\"text-green-800\">
              ✅ Authentication system is working correctly!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}