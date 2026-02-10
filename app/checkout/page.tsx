"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useCart } from "@/contexts/CartContext"
import Container from "@/components/layout/Container"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { toast } from "react-hot-toast"
import {
    MapPin,
    CreditCard,
    Bike,
    Store,
    Trash2,
    Plus,
    ArrowLeft,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import AddressModal from "@/components/features/checkout/AddressModal"
import { createOrder } from "@/actions/order"

export default function CheckoutPage() {
    const router = useRouter()
    const { data: session, status } = useSession()
    const { items, removeFromCart, updateQuantity, getTotal, clearCart } = useCart()

    const [deliveryType, setDeliveryType] = useState("DELIVERY")
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("")
    const [selectedAddress, setSelectedAddress] = useState("")
    const [orderNotes, setOrderNotes] = useState("")
    const [addresses, setAddresses] = useState<any[]>([])
    const [paymentMethods, setPaymentMethods] = useState<any[]>([])
    const [restaurantData, setRestaurantData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)

    useEffect(() => {
        if (status === "unauthenticated") {
            toast.error("Faça login para continuar")
            router.push("/auth/signin?redirect=/checkout")
        }
    }, [status, router])

    useEffect(() => {
        if (items.length === 0) {
            toast.error("Seu carrinho está vazio")
            router.push("/")
        }
    }, [items, router])

    const fetchData = useCallback(async () => {
        try {
            if (!items || items.length === 0) return
            const restaurantId = items[0].restaurantId
            const res = await fetch(`/api/checkout/data?restaurantId=${restaurantId}`)
            const data = await res.json()

            setAddresses(data.addresses || [])
            setPaymentMethods(data.paymentMethods || [])
            setRestaurantData(data.restaurant)

            // Set default delivery type based on availability
            if (data.restaurant) {
                if (data.restaurant.acceptsDelivery && !data.restaurant.acceptsPickup) {
                    setDeliveryType("DELIVERY")
                } else if (!data.restaurant.acceptsDelivery && data.restaurant.acceptsPickup) {
                    setDeliveryType("PICKUP")
                }
            }

            if (data.addresses?.length) {
                const def = data.addresses.find((a: any) => a.isDefault)
                if (!selectedAddress) {
                    setSelectedAddress(def ? def.id : data.addresses[0].id)
                }
            }
        } catch (err) {
            console.error(err)
            toast.error("Erro ao carregar dados")
        }
    }, [items, selectedAddress])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleRemoveItem = (productId: string) => {
        removeFromCart(productId)
    }

    const handleUpdateQuantity = (productId: string, newQuantity: number) => {
        updateQuantity(productId, newQuantity)
    }

    const handlePlaceOrder = async () => {
        if (deliveryType === "DELIVERY" && !selectedAddress) {
            toast.error("Selecione um endereço")
            return
        }
        if (!selectedPaymentMethod) {
            toast.error("Selecione forma de pagamento")
            return
        }

        setIsLoading(true)

        try {
            const orderData = {
                items: items.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.price,
                    totalPrice: item.price * item.quantity,
                    notes: item.notes,
                })),
                restaurantId: items[0].restaurantId,
                totalAmount: subtotal,
                deliveryFee,
                finalAmount: total,
                deliveryType: deliveryType as "DELIVERY" | "PICKUP",
                paymentMethodId: selectedPaymentMethod,
                addressId: selectedAddress || null,
                deliveryAddress: deliveryType === "DELIVERY"
                    ? addresses.find(a => a.id === selectedAddress)
                        ? `${addresses.find(a => a.id === selectedAddress).street}, ${addresses.find(a => a.id === selectedAddress).number} - ${addresses.find(a => a.id === selectedAddress).neighborhood}, ${addresses.find(a => a.id === selectedAddress).city}/${addresses.find(a => a.id === selectedAddress).state} - CEP: ${addresses.find(a => a.id === selectedAddress).zipCode}`
                        : null
                    : null,
                notes: orderNotes,
            }

            const result = await createOrder(orderData)

            if (!result.success) {
                throw new Error(result.message || "Erro ao criar pedido")
            }

            toast.success("Pedido realizado com sucesso!")
            clearCart()
            router.push(`/orders/${result.orderNumber}`)
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || "Erro ao finalizar pedido")
        } finally {
            setIsLoading(false)
        }
    }

    const subtotal = getTotal()
    const restaurant = items[0] ? { name: items[0].restaurantName, slug: items[0].restaurantSlug } : null

    // Use dynamic delivery fee
    const deliveryFee = deliveryType === "DELIVERY"
        ? (restaurantData?.deliveryFee || 0)
        : 0

    const total = subtotal + deliveryFee

    if (!restaurant) return null

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <Container>
                <div className="max-w-6xl mx-auto">
                    <Link href={`/restaurant/${restaurant.slug}`}>
                        <Button variant="ghost" size="sm" className="gap-2 mb-4">
                            <ArrowLeft className="h-4 w-4" />
                            Voltar para restaurante
                        </Button>
                    </Link>

                    <h1 className="text-3xl font-bold mt-4 mb-8">Finalizar Pedido</h1>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Coluna Principal */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Tipo de Entrega */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Bike className="h-5 w-5" />
                                        Tipo de Entrega
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <RadioGroup
                                        value={deliveryType}
                                        onValueChange={setDeliveryType}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                    >
                                        {restaurantData?.acceptsDelivery && (
                                            <div
                                                onClick={() => setDeliveryType("DELIVERY")}
                                                className={`flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:border-primary transition ${deliveryType === "DELIVERY" ? "border-primary bg-primary/5" : ""
                                                    }`}
                                            >
                                                <RadioGroupItem value="DELIVERY" id="delivery" />
                                                <Label htmlFor="delivery" className="flex-1 cursor-pointer">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Bike className="h-4 w-4" />
                                                            <span>Entrega no endereço</span>
                                                        </div>
                                                        <span className="text-sm text-muted-foreground">
                                                            R$ {Number(restaurantData?.deliveryFee || 0).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </Label>
                                            </div>
                                        )}

                                        {restaurantData?.acceptsPickup && (
                                            <div
                                                onClick={() => setDeliveryType("PICKUP")}
                                                className={`flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:border-primary transition ${deliveryType === "PICKUP" ? "border-primary bg-primary/5" : ""
                                                    }`}
                                            >
                                                <RadioGroupItem value="PICKUP" id="pickup" />
                                                <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Store className="h-4 w-4" />
                                                            <span>Retirar no local</span>
                                                        </div>
                                                        <span className="text-sm text-green-600 font-medium">
                                                            Grátis
                                                        </span>
                                                    </div>
                                                </Label>
                                            </div>
                                        )}
                                    </RadioGroup>

                                    {!restaurantData?.acceptsDelivery && !restaurantData?.acceptsPickup && (
                                        <div className="text-red-500 text-sm mt-2">
                                            Este restaurante não está aceitando pedidos no momento.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Endereço */}
                            {deliveryType === "DELIVERY" && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <MapPin className="h-5 w-5" />
                                            Endereço de Entrega
                                        </CardTitle>
                                        <div className="ml-auto">
                                            <Button variant="outline" size="sm" onClick={() => setIsAddressModalOpen(true)}>
                                                <Plus className="mr-2 h-4 w-4" /> Adicionar
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {addresses.length === 0 ? (
                                            <div className="text-center py-8">
                                                <p className="text-muted-foreground">Nenhum endereço cadastrado</p>
                                                <div className="mt-4 flex justify-center">
                                                    <Button onClick={() => setIsAddressModalOpen(true)}>
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Adicionar endereço
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <RadioGroup value={selectedAddress} onValueChange={(v) => setSelectedAddress(v)}>
                                                <div className="space-y-3">
                                                    {addresses.map((address: any) => (
                                                        <div
                                                            key={address.id}
                                                            role="button"
                                                            tabIndex={0}
                                                            onClick={() => setSelectedAddress(address.id)}
                                                            onKeyDown={(e) => { if (e.key === "Enter") setSelectedAddress(address.id) }}
                                                            className={`border rounded-lg p-4 cursor-pointer hover:border-primary transition ${selectedAddress === address.id ? "border-primary bg-primary/5" : ""
                                                                }`}
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex items-start gap-3">
                                                                    <div>
                                                                        <RadioGroupItem value={address.id} id={address.id} />
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-medium">
                                                                            {address.street} {address.number}{address.complement ? `, ${address.complement}` : ""}
                                                                        </div>
                                                                        <div className="text-sm text-muted-foreground">
                                                                            {address.neighborhood} — {address.city}/{address.state} • CEP {address.zipCode}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="text-sm text-muted-foreground">{address.isDefault ? "Padrão" : ""}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </RadioGroup>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Forma de Pagamento */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="h-5 w-5" />
                                        Forma de Pagamento
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {paymentMethods.length === 0 ? (
                                        <p>Carregando métodos de pagamento...</p>
                                    ) : (
                                        <RadioGroup value={selectedPaymentMethod} onValueChange={(v) => setSelectedPaymentMethod(v)}>
                                            <div className="space-y-3">
                                                {paymentMethods.map((pm: any) => (
                                                    <div
                                                        key={pm.id}
                                                        role="button"
                                                        tabIndex={0}
                                                        onClick={() => setSelectedPaymentMethod(pm.id)}
                                                        onKeyDown={(e) => { if (e.key === "Enter") setSelectedPaymentMethod(pm.id) }}
                                                        className={`border rounded-lg p-4 cursor-pointer hover:border-primary transition ${selectedPaymentMethod === pm.id ? "border-primary bg-primary/5" : ""
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <RadioGroupItem value={pm.id} id={pm.id} />
                                                                <div>
                                                                    <div className="font-medium">{pm.name}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </RadioGroup>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Observações */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Observações do Pedido (opcional)</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Textarea
                                        placeholder="Ex: Entregar na portaria, campainha não funciona..."
                                        value={orderNotes}
                                        onChange={(e) => setOrderNotes(e.target.value)}
                                        rows={4}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar - Resumo */}
                        <div className="lg:col-span-1">
                            <div className="space-y-6 sticky top-8">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Resumo do Pedido</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                                            {items.map((item) => (
                                                <div
                                                    key={item.productId}
                                                    className="flex gap-3 pb-3 border-b last:border-0"
                                                >
                                                    {item.image ? (
                                                        <div className="relative w-16 h-16 rounded bg-gray-100 overflow-hidden shrink-0">
                                                            <Image
                                                                src={item.image}
                                                                alt={item.name}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="w-16 h-16 rounded bg-gray-100 flex items-center justify-center shrink-0">
                                                            <Store className="h-6 w-6 text-gray-300" />
                                                        </div>
                                                    )}

                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-medium text-sm line-clamp-1">
                                                            {item.name}
                                                        </h4>
                                                        <p className="text-xs text-muted-foreground">
                                                            {item.quantity}x R$ {item.price.toFixed(2)}
                                                        </p>
                                                        {item.notes && (
                                                            <p className="text-xs italic text-gray-500 line-clamp-1">
                                                                {item.notes}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-col items-end justify-between">
                                                        <p className="text-sm font-bold">
                                                            R$ {(item.price * item.quantity).toFixed(2)}
                                                        </p>
                                                        <div className="flex items-center gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6"
                                                                onClick={() => handleRemoveItem(item.productId)}
                                                            >
                                                                <Trash2 className="h-3 w-3 text-red-500" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <Separator />

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Subtotal</span>
                                                <span>R$ {subtotal.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Taxa de entrega</span>
                                                <span>
                                                    {deliveryType === "DELIVERY"
                                                        ? `R$ ${deliveryFee.toFixed(2)}`
                                                        : "Grátis"}
                                                </span>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="flex justify-between font-bold text-lg">
                                            <span>Total</span>
                                            <span className="text-primary">
                                                R$ {total.toFixed(2)}
                                            </span>
                                        </div>

                                        <Button
                                            className="w-full"
                                            size="lg"
                                            onClick={handlePlaceOrder}
                                            disabled={isLoading || (!restaurantData?.acceptsDelivery && !restaurantData?.acceptsPickup)}
                                        >
                                            {isLoading
                                                ? "Finalizando..."
                                                : `Finalizar Pedido - R$ ${total.toFixed(2)}`}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
            <AddressModal
                isOpen={isAddressModalOpen}
                onClose={() => setIsAddressModalOpen(false)}
                onSuccess={() => {
                    setIsAddressModalOpen(false)
                    fetchData()
                }}
            />
        </div>
    )
}
