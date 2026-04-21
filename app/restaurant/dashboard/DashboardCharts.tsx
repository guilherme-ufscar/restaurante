"use client"

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from "recharts"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

interface ChartData {
    date: string
    amount: number
}

interface DashboardChartsProps {
    data: ChartData[]
}

export default function DashboardCharts({ data }: DashboardChartsProps) {
    // Agrupar dados por dia
    const groupedData = data.reduce((acc, curr) => {
        const dateKey = format(parseISO(curr.date), "dd/MM")
        const existing = acc.find(item => item.date === dateKey)
        if (existing) {
            existing.amount += curr.amount
        } else {
            acc.push({ date: dateKey, amount: curr.amount })
        }
        return acc
    }, [] as { date: string; amount: number }[])

    // Ordenar por data (assumindo que já vem ordenado do backend, mas o reduce pode bagunçar se não cuidar)
    // Como a chave é dd/MM, a ordenação simples pode falhar na virada de ano, mas para 7 dias ok.
    // Melhor confiar na ordem de entrada se o backend mandou ordenado.

    if (groupedData.length === 0) {
        return (
            <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                Sem dados suficientes para o gráfico.
            </div>
        )
    }

    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={groupedData}>
                <XAxis
                    dataKey="date"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `R$${value}`}
                />
                <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`R$ ${value.toFixed(2)}`, "Receita"]}
                />
                <Bar
                    dataKey="amount"
                    fill="currentColor"
                    radius={[4, 4, 0, 0]}
                    className="fill-primary"
                />
            </BarChart>
        </ResponsiveContainer>
    )
}
