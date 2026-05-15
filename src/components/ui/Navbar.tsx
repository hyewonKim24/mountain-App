'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X, Mountain } from 'lucide-react'

const navItems = [
  { href: '/', label: '대시보드' },
  { href: '/map', label: '지도 탐색' },
  { href: '/mountains', label: '명산 도감' },
  { href: '/diary', label: '등산 일기' },
  { href: '/gallery', label: '사진 갤러리' },
  { href: '/badges', label: '배지함' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-[#2A4E38] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-2 text-white font-bold text-sm">
          <Mountain size={20} className="text-[#C4A882]" />
          <span className="hidden sm:block">혜원 & 욱태의 100대 명산</span>
          <span className="sm:hidden">100대 명산</span>
        </Link>

        {/* 데스크탑 메뉴 */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                pathname === item.href
                  ? 'bg-[#6B9E7B] text-white'
                  : 'text-[#C4A882] hover:text-white hover:bg-[#3D6B4F]'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* 모바일 햄버거 */}
        <button
          className="md:hidden text-white p-1"
          onClick={() => setOpen(!open)}
          aria-label="메뉴"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* 모바일 드롭다운 */}
      {open && (
        <div className="md:hidden bg-[#2A4E38] border-t border-[#3D6B4F] px-4 pb-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`block py-2.5 text-sm font-medium border-b border-[#3D6B4F] last:border-0 ${
                pathname === item.href ? 'text-[#6B9E7B]' : 'text-[#C4A882]'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
