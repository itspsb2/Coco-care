import { Link } from 'react-router'
import logo from '@/imports/image-3.png'

type CocoCareLogoProps = {
  to?: string
  className?: string
  iconClassName?: string
}

export function CocoCareLogo({
  to,
  className = '',
  iconClassName = 'h-9 w-auto',
}: CocoCareLogoProps) {
  const content = (
    <div className={`flex items-center ${className}`}>
      <img
        src={logo}
        alt="CocoCare"
        className={`${iconClassName} shrink-0`}
        style={{
          filter:
            'brightness(0) saturate(100%) invert(21%) sepia(48%) saturate(1200%) hue-rotate(70deg) brightness(95%) contrast(90%)',
        }}
      />
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
