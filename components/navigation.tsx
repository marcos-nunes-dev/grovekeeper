'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Builds', href: '/builds' },
  { name: 'Regear Calculator', href: '/regear-calculator' },
  { name: 'Attendance', href: '/attendance' },
  { name: 'Profile', href: '/profile' },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed top-14 left-0 right-0 z-40 bg-[#0D1117] border-b border-zinc-800">
      <div className="flex h-12 max-w-[1920px] mx-auto px-4">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center px-4 text-sm font-medium border-b-2 transition-colors ${
              pathname === item.href
                ? 'border-[#00E6B4] text-white'
                : 'border-transparent text-zinc-400 hover:text-white hover:border-zinc-600'
            }`}
          >
            {item.name}
          </Link>
        ))}
      </div>
    </nav>
  )
}

