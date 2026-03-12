"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface PrintOrderButtonProps {
    order: any
    restaurantName: string
    restaurantPhone?: string
    restaurantAddress?: string
    siteLogo?: string
}

export default function PrintOrderButton({
    order,
    restaurantName,
    restaurantPhone,
    restaurantAddress,
    siteLogo
}: PrintOrderButtonProps) {
    const [isPrinting, setIsPrinting] = useState(false)

    const handlePrint = () => {
        setIsPrinting(true)

        const printWindow = window.open('', '_blank', 'width=800,height=600')

        if (!printWindow) {
            alert('Por favor, permita pop-ups para imprimir a comanda')
            setIsPrinting(false)
            return
        }

        const itemsTotal = order.items.reduce((sum: number, item: any) =>
            sum + Number(item.totalPrice), 0
        )

        const printContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Comanda #${order.orderNumber}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
              font-family: 'Courier New', monospace;
              max-width: 80mm;
              margin: 0 auto;
              padding: 10mm;
              font-size: 12pt;
              line-height: 1.4;
            }

            .header {
              text-align: center;
              border-bottom: 2px dashed #000;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }

            .logo {
              max-width: 60px;
              height: auto;
              margin-bottom: 8px;
            }

            .restaurant-name {
              font-size: 16pt;
              font-weight: bold;
              margin-bottom: 4px;
            }

            .restaurant-info {
              font-size: 10pt;
              color: #333;
            }

            .order-info {
              margin: 15px 0;
              padding: 10px 0;
              border-bottom: 1px solid #000;
            }

            .order-number {
              font-size: 18pt;
              font-weight: bold;
              text-align: center;
              margin-bottom: 8px;
            }

            .info-row {
              display: flex;
              justify-content: space-between;
              margin: 4px 0;
              font-size: 11pt;
            }

            .info-label {
              font-weight: bold;
            }

            .delivery-type {
              display: inline-block;
              background: #000;
              color: #fff;
              padding: 4px 12px;
              border-radius: 4px;
              font-size: 10pt;
              font-weight: bold;
              margin: 8px 0;
            }

            .items {
              margin: 15px 0;
              border-top: 1px solid #000;
              border-bottom: 2px solid #000;
              padding: 10px 0;
            }

            .items-title {
              font-size: 13pt;
              font-weight: bold;
              margin-bottom: 10px;
            }

            .item {
              margin: 8px 0;
              padding: 6px 0;
              border-bottom: 1px dashed #ccc;
            }

            .item:last-child {
              border-bottom: none;
            }

            .item-header {
              display: flex;
              justify-content: space-between;
              font-weight: bold;
              margin-bottom: 4px;
            }

            .item-quantity {
              background: #000;
              color: #fff;
              padding: 2px 8px;
              border-radius: 3px;
              font-size: 10pt;
            }

            .item-name {
              flex: 1;
              margin-left: 8px;
            }

            .item-price {
              font-weight: bold;
            }

            .item-notes {
              font-size: 10pt;
              color: #666;
              font-style: italic;
              margin-top: 4px;
              padding-left: 30px;
            }

            .totals {
              margin: 15px 0;
              font-size: 12pt;
            }

            .total-row {
              display: flex;
              justify-content: space-between;
              margin: 6px 0;
            }

            .total-row.final {
              font-size: 16pt;
              font-weight: bold;
              border-top: 2px solid #000;
              padding-top: 8px;
              margin-top: 10px;
            }

            .customer-info {
              margin: 15px 0;
              padding: 10px;
              background: #f5f5f5;
              border-radius: 4px;
            }

            .address {
              font-size: 10pt;
              margin-top: 8px;
              padding: 8px;
              background: #fff;
              border: 1px dashed #000;
            }

            .footer {
              text-align: center;
              margin-top: 20px;
              padding-top: 15px;
              border-top: 2px dashed #000;
              font-size: 10pt;
            }

            .footer-note {
              margin-top: 10px;
              font-size: 9pt;
              color: #666;
            }

            @media print {
              body {
                padding: 0;
              }

              .no-print {
                display: none !important;
              }

              @page {
                margin: 5mm;
                size: 80mm auto;
              }
            }

            .print-button {
              background: #ea580c;
              color: white;
              border: none;
              padding: 12px 24px;
              font-size: 14pt;
              border-radius: 8px;
              cursor: pointer;
              margin: 20px auto;
              display: block;
              font-family: Arial, sans-serif;
            }

            .print-button:hover {
              background: #c2410c;
            }
          </style>
        </head>
        <body>
          <!-- Cabeçalho -->
          <div class="header">
            ${siteLogo ? `<img src="${siteLogo}" alt="Logo" class="logo" />` : ''}
            <div class="restaurant-name">${restaurantName}</div>
            ${restaurantPhone ? `<div class="restaurant-info">Tel: ${restaurantPhone}</div>` : ''}
            ${restaurantAddress ? `<div class="restaurant-info">${restaurantAddress}</div>` : ''}
          </div>

          <!-- Informações do Pedido -->
          <div class="order-number">PEDIDO #${order.orderNumber}</div>

          <div class="order-info">
            <div class="info-row">
              <span class="info-label">Data/Hora:</span>
              <span>${format(new Date(order.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
            </div>

            <div class="info-row">
              <span class="info-label">Status:</span>
              <span>${getStatusText(order.status)}</span>
            </div>

            <div style="text-align: center; margin-top: 10px;">
              <span class="delivery-type">
                ${order.deliveryType === 'DELIVERY' ? '🛵 ENTREGA' : '🏪 RETIRADA'}
              </span>
            </div>
          </div>

          <!-- Informações do Cliente -->
          <div class="customer-info">
            <div class="info-row">
              <span class="info-label">Cliente:</span>
              <span>${order.user?.name || 'Cliente'}</span>
            </div>
            ${order.user?.email ? `
              <div class="info-row">
                <span class="info-label">Email:</span>
                <span style="font-size: 10pt;">${order.user.email}</span>
              </div>
            ` : ''}
            
            ${order.deliveryType === 'DELIVERY' && order.deliveryAddress ? `
              <div class="address">
                <strong>📍 Endereço de Entrega:</strong><br/>
                ${order.deliveryAddress}
              </div>
            ` : ''}
          </div>

          <!-- Itens do Pedido -->
          <div class="items">
            <div class="items-title">ITENS DO PEDIDO</div>
            
            ${order.items.map((item: any) => `
              <div class="item">
                <div class="item-header">
                  <span class="item-quantity">${item.quantity}x</span>
                  <span class="item-name">${item.product?.name || item.productId}</span>
                  <span class="item-price">
                    ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(item.totalPrice))}
                  </span>
                </div>
                ${item.notes ? `<div class="item-notes">📝 ${item.notes}</div>` : ''}
              </div>
            `).join('')}
          </div>

          <!-- Totais -->
          <div class="totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(itemsTotal)}</span>
            </div>

            <div class="total-row">
              <span>Taxa de Entrega:</span>
              <span>${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(order.deliveryFee))}</span>
            </div>

            ${order.discount && Number(order.discount) > 0 ? `
              <div class="total-row">
                <span>Desconto:</span>
                <span>-${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(order.discount))}</span>
              </div>
            ` : ''}

            <div class="total-row final">
              <span>TOTAL:</span>
              <span>${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(order.finalAmount))}</span>
            </div>
          </div>

          ${order.notes ? `
            <div style="margin: 15px 0; padding: 10px; background: #fffbeb; border: 1px solid #fcd34d; border-radius: 4px;">
              <strong>📌 Observações do Cliente:</strong><br/>
              ${order.notes}
            </div>
          ` : ''}

          <!-- Rodapé -->
          <div class="footer">
            <div>Obrigado pela preferência!</div>
            <div class="footer-note">
              Esta é uma comanda para controle interno<br/>
              Impressa em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </div>
          </div>

          <button class="print-button no-print" onclick="window.print()">
            🖨️ Imprimir Comanda
          </button>

          <script>
            // Auto-abrir diálogo de impressão após 1 segundo
            setTimeout(() => {
              window.print()
            }, 1000)
          </script>
        </body>
      </html>
    `

        printWindow.document.write(printContent)
        printWindow.document.close()

        // Resetar estado após fechar janela
        printWindow.onafterprint = () => {
            setIsPrinting(false)
        }

        printWindow.onbeforeunload = () => {
            setIsPrinting(false)
        }
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            disabled={isPrinting}
            className="gap-2"
        >
            <Printer className="w-4 h-4" />
            {isPrinting ? 'Imprimindo...' : 'Imprimir Comanda'}
        </Button>
    )
}

function getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
        PENDING: 'Aguardando Confirmação',
        CONFIRMED: 'Confirmado',
        PREPARING: 'Em Preparo',
        READY: 'Pronto',
        DELIVERING: 'Saiu para Entrega',
        COMPLETED: 'Concluído',
        CANCELLED: 'Cancelado',
    }
    return statusMap[status] || status
}
