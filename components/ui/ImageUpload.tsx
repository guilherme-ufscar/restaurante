"use client"

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { ImageIcon, X, UploadCloud } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
    value?: string
    onChange: (value: string) => void
    onRemove: () => void
    className?: string
}

export default function ImageUpload({
    value,
    onChange,
    onRemove,
    className
}: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false)

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (!file) return

        setIsUploading(true)
        const reader = new FileReader()
        reader.onloadend = () => {
            onChange(reader.result as string)
            setIsUploading(false)
        }
        reader.readAsDataURL(file)
    }, [onChange])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp']
        },
        maxFiles: 1,
        disabled: !!value
    })

    return (
        <div className={cn("space-y-4 w-full", className)}>
            {value ? (
                <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-dashed border-gray-200 group">
                    <img
                        src={value}
                        alt="Upload"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={onRemove}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            ) : (
                <div
                    {...getRootProps()}
                    className={cn(
                        "relative aspect-video rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center p-6 text-center",
                        isDragActive
                            ? "border-primary bg-primary/5 scale-[0.98]"
                            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50",
                        isUploading && "opacity-50 cursor-not-allowed"
                    )}
                >
                    <input {...getInputProps()} />

                    <div className="bg-primary/10 p-4 rounded-full mb-4">
                        <UploadCloud className="h-8 w-8 text-primary" />
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm font-semibold">
                            {isDragActive ? "Solte para enviar" : "Clique para selecionar ou arraste"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            PNG, JPG ou WebP (Máx. 5MB)
                        </p>
                    </div>

                    {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                            <div className="text-primary font-medium animate-pulse text-sm">Convertendo...</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
