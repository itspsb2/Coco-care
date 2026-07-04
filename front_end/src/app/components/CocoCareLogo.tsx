import { Sprout } from 'lucide-react'
import { Link } from 'react-router'

type CocoCareLogoProps = {
  to?: string
  className?: string
  iconClassName?: string
  textClassName?: string
}

export function CocoCareLogo({
  to,
  className = '',
  iconClassName = 'w-8 h-8',
  textClassName = 'text-xl',
}: CocoCareLogoProps) {
  const content = (
    <div className={`flex items-center gap-2 ${className}`}>
      <Sprout className={`${iconClassName} text-[#2d5f2e] shrink-0`} />
      <span className={`${textClassName} font-semibold text-[#2d5f2e] whitespace-nowrap`}>
        Coco Care
      </span>
    </div>
  )

  if (to) {
    return (
      <Link to={to} className="hover:opacity-90 transition-opacity">
        {content}
      </Link>
    )
  }

  return content
}
