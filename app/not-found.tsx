import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileQuestion } from "lucide-react"

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
            <FileQuestion className="h-24 w-24 text-gray-400 mb-6" />
            <h2 className="text-4xl font-bold mb-4">Página Não Encontrada</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-md">
                A página que você está procurando não existe ou foi movida.
            </p>
            <Button asChild size="lg">
                <Link href="/">
                    Voltar para Home
                </Link>
            </Button>
        </div>
    )
}
