"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { createProduct } from "@/actions/product"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Upload, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { VariationForm } from "@/components/features/restaurant/VariationForm"

const productSchema = z.object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    description: z.string().optional(),
    category: z.string().min(3, "Categoria é obrigatória"),
    price: z.number().positive("Preço deve ser positivo"),
    discountPrice: z.number().positive("Preço com desconto deve ser positivo").optional().nullable(),
    image: z.string().optional().nullable(),
    preparationTime: z.number().int().positive().optional().nullable(),

    isAvailable: z.boolean(),
    variations: z.array(z.object({
        name: z.string().min(1, "Nome da variação obrigatório"),
        required: z.boolean(),
        multiSelect: z.boolean(),
        options: z.array(z.object({
            name: z.string().min(1, "Nome da opção obrigatório"),
            price: z.number().min(0, "Preço deve ser positivo"),
        })).min(1, "Adicione pelo menos uma opção"),
    })).optional(),
}).refine((data) => {
    if (data.discountPrice && data.discountPrice >= data.price) {
        return false
    }
    return true
}, {
    message: "Preço com desconto deve ser menor que o preço original",
    path: ["discountPrice"],
})

interface NewProductPageProps {
    searchParams: Promise<{ restaurantId?: string }>
}

export default function NewProductPage({ searchParams }: NewProductPageProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    // Resolver searchParams (Next.js 15+)
    // Como é Client Component, usamos use() ou await se fosse server, mas aqui props vem como Promise
    // Simplificando: vamos assumir que o restaurantId vem da session no server action, 
    // mas se precisarmos passar via URL, teríamos que resolver a promise.
    // O server action createProduct já pega o restaurantId da session se não passado, 
    // mas a assinatura pede restaurantId. Vamos buscar o restaurantId no server side wrapper ou
    // ajustar a action para buscar pelo usuário logado se não vier o ID.
    // Ajuste: A action createProduct pede restaurantId.
    // Vamos fazer um wrapper server component para passar o restaurantId correto.

    const form = useForm<z.infer<typeof productSchema>>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: "",
            description: "",
            category: "",
            price: 0,
            discountPrice: null,
            image: null,
            preparationTime: null,
            isAvailable: true,
        },
    })

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                const img = new window.Image();
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx?.drawImage(img, 0, 0, width, height);
                    const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);

                    setImagePreview(compressedBase64)
                    form.setValue("image", compressedBase64)
                };
                img.src = reader.result as string;
            }
            reader.readAsDataURL(file)
        }
    }

    const removeImage = () => {
        setImagePreview(null)
        form.setValue("image", null)
    }

    async function onSubmit(values: z.infer<typeof productSchema>) {
        setIsLoading(true)
        try {
            // Precisamos do restaurantId. Como este é um Client Component, 
            // o ideal seria receber via props de um Server Component pai.
            // Para simplificar, vou criar um componente Wrapper Server Side que busca o ID.
            // Mas por enquanto, vou assumir que a action consegue resolver ou vou buscar via API.
            // Melhor: Vou transformar a página em Server Component que renderiza este form client.

            // ATENÇÃO: Vou criar este arquivo como Client Form e a page.tsx como Server Component.
            // Mas o prompt pediu "Crie a página ... como Client Component".
            // Vou seguir o prompt, mas vou precisar buscar o restaurantId.
            // Vou fazer um fetch rápido ou server action para pegar o ID do restaurante do usuário.

            // Workaround: Vou buscar o ID do restaurante via uma Server Action auxiliar ou passar via props se eu mudar a estrutura.
            // Vou assumir que o usuário logado TEM um restaurante e a action createProduct vai buscar o ID dele se eu passar uma string vazia ou ajustar a action.
            // Ajuste na action: createProduct(data, restaurantId).
            // Vou criar uma action auxiliar `getRestaurantId` aqui mesmo ou importar.

            // Vamos fazer o seguinte: A page.tsx será Server Component (padrão Next 13+) e importará este Form.
            // Mas o prompt pediu explicitamente "app/restaurant/dashboard/products/new/page.tsx como Client Component".
            // Vou seguir o prompt. Para pegar o restaurantId, vou usar uma server action inline ou assumir que a action createProduct busca pelo session.user.id.
            // Vou alterar a action createProduct para buscar o restaurante pelo ownerId se o restaurantId não for passado ou for "me".

            const result = await createProduct(values, "me") // "me" será tratado na action

            if (result.success) {
                toast.success("Produto criado com sucesso!")
                router.push("/restaurant/dashboard/products")
                router.refresh()
            } else {
                toast.error(result.message || "Erro ao criar produto")
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
                    <Link href="/restaurant/dashboard/products">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold">Novo Produto</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Detalhes do Produto</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome do Produto</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: X-Bacon Especial" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Descrição</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Descreva os ingredientes e detalhes..."
                                                className="resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Categoria</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Lanches">Lanches</SelectItem>
                                                    <SelectItem value="Pizzas">Pizzas</SelectItem>
                                                    <SelectItem value="Bebidas">Bebidas</SelectItem>
                                                    <SelectItem value="Sobremesas">Sobremesas</SelectItem>
                                                    <SelectItem value="Porções">Porções</SelectItem>
                                                    <SelectItem value="Pratos">Pratos</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="preparationTime"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tempo de Preparo (min)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={e => field.onChange(e.target.valueAsNumber)}
                                                    value={field.value || ""}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Preço (R$)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    {...field}
                                                    onChange={e => field.onChange(e.target.valueAsNumber)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="discountPrice"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Preço Promocional (Opcional)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    {...field}
                                                    onChange={e => field.onChange(e.target.value ? e.target.valueAsNumber : null)}
                                                    value={field.value || ""}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="image"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Imagem do Produto</FormLabel>
                                        <FormControl>
                                            <div className="flex flex-col gap-4">
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                />
                                                {imagePreview && (
                                                    <div className="relative h-40 w-full rounded-md overflow-hidden border">
                                                        <Image
                                                            src={imagePreview}
                                                            alt="Preview"
                                                            fill
                                                            className="object-cover"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="icon"
                                                            className="absolute top-2 right-2 h-8 w-8"
                                                            onClick={removeImage}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="isAvailable"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                Disponível para venda
                                            </FormLabel>
                                            <FormDescription>
                                                Se desmarcado, o produto não aparecerá no cardápio para os clientes.
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <VariationForm />

                            <div className="flex gap-4 pt-4">
                                <Button variant="outline" type="button" className="w-full" asChild>
                                    <Link href="/restaurant/dashboard/products">Cancelar</Link>
                                </Button>
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? "Salvando..." : "Salvar Produto"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
