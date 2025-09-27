import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

const Container = ({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) => {
  return (
    <div className={cn('mx-auto py-0 md:px-8 lg:px-4 my-0 w-full max-w-screen-xl', className)}>
      {children}
    </div>
  )
}

export { Container }