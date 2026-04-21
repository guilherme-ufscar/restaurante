"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, Clock, ChevronDown, ChevronUp, TrendingUp, Store } from "lucide-react"
import { markRepaymentAsPaid, markRepaymentAsUnpaid } from "@/actions/admin"
import { toast } from "react-hot-toast"

const MONTH_NAMES = [
    "", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

interface Repayment {
    id: string
    month: number
    year: number
    grossAmount: number
    totalFees: number
    netAmount: number
    isPaid: boolean
    paidAt: Date | null
    transactionsCount: number
    restaurant: { id: string; name: string; email: string }
}

interface Props {
    repayments: Repayment[]
    totalPlatformRevenue: number
    pixFee: number
}

export default function AdminFinanceiroClient({ repayments, totalPlatformRevenue, pixFee }: Props) {
    const [expanded, setExpanded] = useState<string | null>(null)
    const [loading, setLoading] = useState<string | null>(null)

    const pendingRepayments = repayments.filter(r => !r.isPaid)
    const pendingTotal = pendingRepayments.reduce((acc, r) => acc + r.netAmount, 0)

    const handleTogglePaid = async (r: Repayment) => {
        setLoading(r.id)
        try {
            const result = r.isPaid
                ? await markRepaymentAsUnpaid(r.id)
                : await markRepaymentAsPaid(r.id)

            if (result.success) {
                toast.success(r.isPaid ? "Marcado como pendente" : "Marcado como pago!")
            } else {
                toast.error(result.message || "Erro")
            }
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Financeiro PIX</h1>
                <p className="text-muted-foreground text-sm">
                    Gerencie os repasses dos restaurantes e a receita da plataforma.
                </p>
            </div>

            {/* Cards de resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-5">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="h-8 w-8 text-green-500" />
                            <div>
                                <p className="text-sm text-muted-foreground">Receita da Plataforma</p>
                                <p className="text-2xl font-bold text-green-600">R$ {totalPlatformRevenue.toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground">R$ {pixFee.toFixed(2)} por transação</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-5">
                        <div className="flex items-center gap-3">
                            <Clock className="h-8 w-8 text-amber-500" />
                            <div>
                                <p className="text-sm text-muted-foreground">A Repassar (Pendente)</p>
                                <p className="text-2xl font-bold text-amber-600">R$ {pendingTotal.toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground">{pendingRepayments.length} repasse(s) pendente(s)</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-5">
                        <div className="flex items-center gap-3">
                            <Store className="h-8 w-8 text-blue-500" />
                            <div>
                                <p className="text-sm text-muted-foreground">Total de Repasses</p>
                                <p className="text-2xl font-bold">{repayments.length}</p>
                                <p className="text-xs text-muted-foreground">em todos os meses</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Lista de repasses */}
            {repayments.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center text-muted-foreground">
                        Nenhum repasse PIX registrado ainda.
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {repayments.map((r) => (
                        <Card key={r.id} className={r.isPaid ? "opacity-75" : ""}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div>
                                        <CardTitle className="text-base">{r.restaurant.name}</CardTitle>
                                        <p className="text-sm text-muted-foreground">{r.restaurant.email}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">
                                            {MONTH_NAMES[r.month]} {r.year}
                                        </span>
                                        {r.isPaid ? (
                                            <Badge className="bg-green-100 text-green-700 border-green-200">
                                                <CheckCircle2 className="h-3 w-3 mr-1" /> Pago
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
                                                <Clock className="h-3 w-3 mr-1" /> Pendente
                                            </Badge>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                                        >
                                            {expanded === r.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Transações</p>
                                        <p className="font-semibold">{r.transactionsCount}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Total bruto</p>
                                        <p className="font-semibold">R$ {r.grossAmount.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Taxas retidas</p>
                                        <p className="font-semibold text-green-600">+ R$ {r.totalFees.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">A repassar</p>
                                        <p className="font-bold text-lg text-amber-600">R$ {r.netAmount.toFixed(2)}</p>
                                    </div>
                                </div>

                                {expanded === r.id && (
                                    <>
                                        <Separator />
                                        {r.isPaid && r.paidAt && (
                                            <p className="text-xs text-muted-foreground">
                                                Pago em {new Date(r.paidAt).toLocaleDateString("pt-BR")}
                                            </p>
                                        )}
                                    </>
                                )}

                                <div className="flex justify-end">
                                    <Button
                                        size="sm"
                                        variant={r.isPaid ? "outline" : "default"}
                                        onClick={() => handleTogglePaid(r)}
                                        disabled={loading === r.id}
                                    >
                                        {loading === r.id
                                            ? "Salvando..."
                                            : r.isPaid
                                                ? "Desfazer pagamento"
                                                : "Marcar como pago"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
