'use client'

import {
  Calendar,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Plus,
  User
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

function eraseCookie(name: string) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { id: 'feedback', label: 'Feedback', icon: MessageSquare, href: '/admin/feedback' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter();

  const handleLogout = () => {
    eraseCookie("isAdmin");
    router.push("/login");
  };

  return (
    <div className="w-64 bg-gray-100 shadow-lg min-h-screen text-black">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-black">Admin Panel</h1>
        <p className="text-black text-sm mt-1">Feedback Portal</p>
      </div>
      
      <nav className="mt-6">
        <div className="px-4">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg mb-2 transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : 'text-black hover:bg-gray-200 hover:text-black'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            )
          })}
          <Link
            href="/admin/sessions"
            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg mb-2 transition-colors ${
              pathname === '/admin/sessions'
                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                : 'text-purple-700 hover:bg-purple-100 border border-purple-200'
            }`}
          >
            <Calendar className="w-5 h-5 mr-3" />
            Sessions
          </Link>
          <Link
            href="/admin/create-session"
            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg mb-2 transition-colors ${
              pathname === '/admin/create-session'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-blue-700 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            <Plus className="w-5 h-5 mr-3" />
            Create Session
          </Link>
        </div>
      </nav>

      <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200 text-black">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-black">Admin User</p>
            <p className="text-xs text-black">admin@example.com</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-2 text-sm text-black hover:bg-gray-200 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Logout
        </button>
      </div>
    </div>
  )
}