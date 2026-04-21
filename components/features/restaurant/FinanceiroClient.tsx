"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Mail, Phone, TrendingUp, Clock, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"

const MONTH_NAMES = [
    "", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

interface Transaction {
    id: string
    amount: number
    platformFee: number
    netAmount: number
    status: string
    paidAt: Date | null
    createdAt: Date
}

interface Repayment {
    id: string
    month: number
    year: number
    grossAmount: number
    totalFees: number
    netAmount: number
    isPaid: boolean
    paidAt: Date | null
    transactions: Transaction[]
}

interface Props {
    repayments: Repayment[]
    contactEmail: string | null
    contactPhone: string | null
    pixFee: number
}

export default function RestaurantFinanceiroClient({ repayments, contactEmail, contactPhone, pixFee }: Props) {
    const [expanded, setExpanded] = useState<string | null>(null)

    const pendingTotal = repayments
        .filter(r => !r.isPaid)
        .reduce((acc, r) => acc + r.netAmount, 0)

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Financeiro PIX</h1>
                <p className="text-muted-foreground text-sm">
                    Acompanhe os repasses referentes aos pagamentos PIX realizados no seu restaurante.
                </p>
            </div>

            {/* Aviso de contato */}
            {pendingTotal > 0 && (
                <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="pt-5">
                        <div className="flex items-start gap-3">
                            <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                            <div className="space-y-1">
                                <p className="font-semibold text-blue-800">
                                    Você tem <span className="text-blue-900">R$ {pendingTotal.toFixed(2)}</span> a receber
                                </p>
                                <p className="text-sm text-blue-700">
                                    Os repasses são feitos manualmente ao final de cada mês. Entre em contato com a plataforma para receber:
                                </p>
                                <div className="flex flex-wrap gap-4 pt-1">
                                    {contactEmail && (
                                        <a href={`mailto:${contactEmail}`} className="flex items-center gap-1.5 text-sm text-blue-700 hover:underline">
                                            <Mail className="h-4 w-4" /> {contactEmail}
                                        </a>
                                    )}
                                    {contactPhone && (
                                        <a href={`tel:${contactPhone}`} className="flex items-center gap-1.5 text-sm text-blue-700 hover:underline">
                                            <Phone className="h-4 w-4" /> {contactPhone}
                                        </a>
                                    )}
                                </div>
                                <p className="text-xs text-blue-600 pt-1">
                                    Taxa da plataforma: R$ {pixFee.toFixed(2)} por transação PIX
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {repayments.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center text-muted-foreground">
                        Nenhuma transação PIX registrada ainda.
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {repayments.map((r) => (
                        <Card key={r.id}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">
                                        {MONTH_NAMES[r.month]} {r.year}
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
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
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Total bruto</p>
                                        <p className="font-semibold">R$ {r.grossAmount.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Taxas plataforma</p>
                                        <p className="font-semibold text-red-600">- R$ {r.totalFees.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">A receber</p>
                                        <p className="font-bold text-green-600">R$ {r.netAmount.toFixed(2)}</p>
                                    </div>
                                </div>

                                {r.isPaid && r.paidAt && (
                                    <p className="text-xs text-muted-foreground">
                                        Pago em {new Date(r.paidAt).toLocaleDateString("pt-BR")}
                                    </p>
                                )}

                                {expanded === r.id && (
                                    <>
                                        <Separator />
                                        <p className="text-sm font-medium">Transações ({r.transactions.length})</p>
                                        <div className="space-y-2 max-h-64 overflow-y-auto">
                                            {r.transactions.map((t) => (
                                                <div key={t.id} className="flex justify-between text-xs text-muted-foreground border-b pb-2">
                                                    <span>{new Date(t.createdAt).toLocaleDateString("pt-BR")} {new Date(t.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                                                    <span>Bruto: R$ {t.amount.toFixed(2)}</span>
                                                    <span>Taxa: R$ {t.platformFee.toFixed(2)}</span>
                                                    <span className="font-medium text-green-600">Líq: R$ {t.netAmount.toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
