"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBanner } from "@/actions/banner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2, Link as LinkIcon, Image as ImageIcon, Type } from "lucide-react"
import Link from "next/link"
import { toast } from "react-hot-toast"
import ImageUpload from "@/components/ui/ImageUpload"

export default function NewBannerPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [image, setImage] = useState("")

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (!image) {
            toast.error("Por favor, selecione uma imagem")
            return
        }

        setIsLoading(true)
        const formData = new FormData(event.currentTarget)

        try {
            const result = await createBanner({
                image: image,
                title: formData.get("title") as string,
                description: formData.get("description") as string,
                link: formData.get("link") as string,
                location: formData.get("location") as string,
            })

            if (result.success) {
                toast.success("Banner criado com sucesso!")
                router.push("/admin/banners")
                router.refresh()
            } else {
                toast.error("Erro ao criar banner")
            }
        } catch (error) {
            toast.error("Erro inesperado")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/admin/banners">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold">Novo Banner</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Detalhes do Banner</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-6">

                        <div className="space-y-2">
                            <Label htmlFor="location">Local de Exibição</Label>
                            <Select name="location" defaultValue="HOME">
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o local" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="HOME">Página Inicial (Home)</SelectItem>
                                    <SelectItem value="CATEGORY">Página de Categorias</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <ImageIcon className="h-4 w-4" />
                                Imagem do Banner (Obrigatório)
                            </Label>
                            <ImageUpload
                                value={image}
                                onChange={(val) => setImage(val)}
                                onRemove={() => setImage("")}
                            />
                            <p className="text-xs text-muted-foreground">Recomendado: 1200x400px ou proporção wide (21:9).</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="title" className="flex items-center gap-2">
                                <Type className="h-4 w-4" />
                                Título (Opcional)
                            </Label>
                            <Input id="title" name="title" placeholder="Ex: Promoção de Verão" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Descrição (Opcional)</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Um texto curto que aparecerá sobre a imagem..."
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="link" className="flex items-center gap-2">
                                <LinkIcon className="h-4 w-4" />
                                Link de Destino (Opcional)
                            </Label>
                            <Input id="link" name="link" placeholder="https://..." />
                        </div>

                        <div className="pt-4 flex justify-end gap-4">
                            <Button variant="outline" asChild type="button">
                                <Link href="/admin/banners">Cancelar</Link>
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    "Salvar Banner"
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
