"use client"

import * as Icons from 'lucide-react'
import { LucideProps } from 'lucide-react'

interface DynamicIconProps extends LucideProps {
    name: string
}

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
    const LucideIcon = (Icons as any)[name]
    if (!LucideIcon) return <Icons.UtensilsCrossed {...props} />
    return <LucideIcon {...props} />
}
