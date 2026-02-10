import { getAllBannersAdmin, deleteBanner, toggleBannerStatus } from "@/actions/banner"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Plus, Trash, Pencil, ExternalLink, ImageIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { revalidatePath } from "next/cache"

export default async function BannersPage() {
    const banners = await getAllBannersAdmin()

    async function handleDelete(id: string) {
        "use server"
        await deleteBanner(id)
    }

    async function handleToggle(id: string, current: boolean) {
        "use server"
        await toggleBannerStatus(id, current)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Banners</h1>
                    <p className="text-muted-foreground">Gerencie os banners da Home e Categorias</p>
                </div>
                <Button asChild>
                    <Link href="/admin/banners/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Banner
                    </Link>
                </Button>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Imagem</TableHead>
                            <TableHead>Título / Local</TableHead>
                            <TableHead>Link</TableHead>
                            <TableHead>Ativo</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {banners.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    Nenhum banner cadastrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            banners.map((banner) => (
                                <TableRow key={banner.id}>
                                    <TableCell>
                                        <div className="relative w-24 h-12 rounded overflow-hidden bg-gray-100 border">
                                            {banner.image ? (
                                                <Image
                                                    src={banner.image}
                                                    alt="Banner"
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <ImageIcon className="w-6 h-6 m-auto text-gray-400" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{banner.title || "(Sem título)"}</div>
                                        <Badge variant="outline" className="mt-1">{banner.location}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        {banner.link ? (
                                            <a href={banner.link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center text-sm">
                                                Link <ExternalLink className="ml-1 h-3 w-3" />
                                            </a>
                                        ) : (
                                            <span className="text-muted-foreground text-sm">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <form action={handleToggle.bind(null, banner.id, banner.active)}>
                                            <button type="submit">
                                                <Badge variant={banner.active ? "default" : "destructive"} className="cursor-pointer">
                                                    {banner.active ? "Ativo" : "Inativo"}
                                                </Badge>
                                            </button>
                                        </form>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {/* Edição será implementada depois se der tempo, por enquanto deletar e criar novo */}
                                            {/* <Button variant="ghost" size="icon" asChild>
                                                <Link href={`/admin/banners/${banner.id}`}>
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                            </Button> */}
                                            <form action={handleDelete.bind(null, banner.id)}>
                                                <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </form>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
