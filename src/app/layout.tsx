'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Home, Baby, Users, Heart, FileText } from 'lucide-react'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Initialize sidebar state based on screen size (client-side only)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
    }

    // Set initial
    handleResize()
  }, [])

  return (
    <html lang="id">
      <body className="bg-gray-100 font-sans">
        <div className="flex h-screen overflow-hidden">

          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-20 bg-black/50 md:hidden backdrop-blur-sm transition-opacity"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <aside
            className={`
              fixed inset-y-0 left-0 z-30 flex flex-col bg-blue-900 text-white transition-all duration-300 ease-in-out shadow-xl
              md:relative md:translate-x-0
              ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:w-20 w-64 md:translate-x-0'}
            `}
          >
            <div className="p-4 flex items-center justify-between h-16 border-b border-blue-800/50">
              {/* Logo / Title */}
              <div className={`font-bold text-xl whitespace-nowrap overflow-hidden transition-all duration-300 ${sidebarOpen ? 'w-auto opacity-100' : 'w-0 opacity-0 md:w-auto md:opacity-100'}`}>
                {sidebarOpen ? 'SI-KADAL' : <span className="text-center w-full block text-sm">SK</span>}
              </div>

              {/* Toggle Button (Desktop & Mobile Internal) */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1.5 hover:bg-blue-800 rounded-lg transition-colors ml-auto"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
              <NavLink href="/" icon={Home} label="Beranda" open={sidebarOpen} />
              <NavLink href="/balita" icon={Baby} label="Data Balita" open={sidebarOpen} />
              <NavLink href="/lansia" icon={Users} label="Data Lansia" open={sidebarOpen} />
              <NavLink href="/ibu-hamil" icon={Heart} label="Data Ibu Hamil" open={sidebarOpen} />
              <NavLink href="/laporan" icon={FileText} label="Laporan" open={sidebarOpen} />
            </nav>

            <div className="p-4 border-t border-blue-800 bg-blue-950/30">
              <p className={`text-xs text-blue-200 text-center whitespace-nowrap overflow-hidden transition-all ${sidebarOpen ? 'opacity-100' : 'opacity-0 md:opacity-100 md:text-[10px]'}`}>
                {sidebarOpen ? 'Posyandu Desa Kedungwuluh' : 'PDK'}
              </p>
            </div>
          </aside>

          {/* Main Content Wrapper */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Top Bar */}
            <header className="bg-white shadow-sm h-16 px-4 flex items-center gap-4 z-10 relative">
              {/* Mobile Menu Trigger (Visible when sidebar is closed on mobile) */}
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg md:hidden"
                >
                  <Menu size={24} />
                </button>
              )}

              <div className="flex-1">
                <h2 className="text-lg md:text-2xl font-bold text-gray-800 truncate">
                  Sistem Informasi Kesehatan
                </h2>
                <p className="text-xs md:text-sm text-gray-500 hidden sm:block">
                  Desa Kedungwuluh, Kec. Padaherang
                </p>
              </div>

              <div className="text-xs md:text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                {new Date().toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </header>

            {/* Page Content Scrollable Area */}
            <main className="flex-1 overflow-auto p-2 md:p-6 bg-gray-50/50">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}

function NavLink({ href, icon: Icon, label, open }: { href: string; icon: any; label: string; open: boolean }) {
  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
        hover:bg-blue-700/50 hover:shadow-inner
        ${!open ? 'md:justify-center' : ''}
      `}
      title={label}
    >
      <Icon size={22} className="min-w-[22px]" />
      <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 origin-left ${open ? 'w-auto opacity-100' : 'w-0 opacity-0 md:hidden'}`}>
        {label}
      </span>
    </Link>
  )
}