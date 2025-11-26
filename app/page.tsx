import Link from "next/link"
import { prisma } from "@/lib/prisma"
import Container from "@/components/layout/Container"
import CategoryCard from "@/components/features/home/CategoryCard"
import RestaurantCard from "@/components/features/home/RestaurantCard"
import ProductCard from "@/components/features/home/ProductCard"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  UtensilsCrossed,
  Pizza,
  Beef,
  Fish,
  Coffee,
  IceCream,
  Salad,
  Search,
  Store,
  ShoppingBag,
  Users
} from "lucide-react"

export default async function Home() {
  // Buscas no banco de dados
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    take: 12,
  })

  const restaurants = await prisma.restaurant.findMany({
    where: {
      isActive: true,
      isApproved: true,
      subscriptionStatus: "ACTIVE",
    },
    include: {
      category: true,
    },
    orderBy: [
      { rating: "desc" },
      { totalReviews: "desc" },
    ],
    take: 8,
  })

  const products = await prisma.product.findMany({
    where: {
      isAvailable: true,
      restaurant: {
        isActive: true,
        isApproved: true,
      },
    },
    include: {
      restaurant: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 12,
  })

  // Mapeamento de ícones para categorias
  const iconsMap: Record<string, React.ReactNode> = {
    "Pizza": <Pizza className="w-8 h-8" />,
    "Hamburguer": <Beef className="w-8 h-8" />,
    "Japonesa": <Fish className="w-8 h-8" />,
    "Cafeteria": <Coffee className="w-8 h-8" />,
    "Sobremesas": <IceCream className="w-8 h-8" />,
    "Saudável": <Salad className="w-8 h-8" />,
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 text-white py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

        <Container className="relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-fadeIn">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight drop-shadow-lg">
              Peça comida dos melhores restaurantes
            </h1>
            <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto drop-shadow-md">
              Entrega rápida e segura direto na sua casa. Explore centenas de restaurantes e milhares de pratos deliciosos.
            </p>

            <div className="max-w-2xl mx-auto mt-8 relative">
              <div className="relative flex items-center">
                <Search className="absolute left-4 w-6 h-6 text-gray-400" />
                <input
                  type="text"
                  placeholder="O que você quer comer hoje?"
                  className="w-full pl-12 pr-32 py-4 rounded-full text-gray-900 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-2xl text-lg"
                />
                <Button className="absolute right-2 rounded-full px-8" size="lg">
                  Buscar
                </Button>
              </div>
            </div>

            <div className="flex justify-center gap-8 mt-12 pt-8 border-t border-white/20">
              <div className="flex flex-col items-center gap-1">
                <Store className="w-6 h-6 opacity-80" />
                <span className="font-bold text-2xl">500+</span>
                <span className="text-sm opacity-80">Restaurantes</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ShoppingBag className="w-6 h-6 opacity-80" />
                <span className="font-bold text-2xl">10k+</span>
                <span className="text-sm opacity-80">Pratos</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Users className="w-6 h-6 opacity-80" />
                <span className="font-bold text-2xl">50k+</span>
                <span className="text-sm opacity-80">Clientes</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Categorias */}
      <section className="py-16 bg-white">
        <Container>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Buscar por Categoria</h2>
            <Link
              href="/categories"
              className="text-primary hover:underline flex items-center gap-1 font-medium group"
            >
              Ver todas
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                id={category.id}
                name={category.name}
                slug={category.slug}
                image={category.image}
                icon={iconsMap[category.name] || <UtensilsCrossed className="w-8 h-8" />}
              />
            ))}

            {/* Fallback se não houver categorias */}
            {categories.length === 0 && Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        </Container>
      </section>

      {/* Restaurantes Populares */}
      <section className="py-16 bg-gray-50">
        <Container>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Restaurantes Populares</h2>
            <Link
              href="/restaurants"
              className="text-primary hover:underline flex items-center gap-1 font-medium group"
            >
              Ver todos
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {restaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={{
                  ...restaurant,
                  rating: restaurant.rating ? Number(restaurant.rating) : null,
                  deliveryFee: Number(restaurant.deliveryFee),
                  minOrderValue: Number(restaurant.minOrderValue),
                }}
                category={restaurant.category}
              />
            ))}

            {/* Fallback se não houver restaurantes */}
            {restaurants.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <Store className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Nenhum restaurante encontrado no momento.</p>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* Produtos em Destaque */}
      <section className="py-16 bg-white">
        <Container>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Produtos em Destaque</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  ...product,
                  price: Number(product.price),
                  discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
                }}
                restaurant={product.restaurant}
              />
            ))}

            {/* Fallback se não houver produtos */}
            {products.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Nenhum produto em destaque no momento.</p>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* CTA para Restaurantes */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <Container className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Quer vender na nossa plataforma?
          </h2>
          <p className="text-lg md:text-xl opacity-90 mb-10 max-w-2xl mx-auto">
            Cadastre seu restaurante hoje mesmo e comece a vender para milhares de clientes na sua região. Taxas competitivas e suporte dedicado.
          </p>
          <Button size="lg" variant="secondary" className="px-8 text-lg h-14" asChild>
            <Link href="/auth/signup?type=restaurant">
              Cadastre seu Restaurante
            </Link>
          </Button>
        </Container>
      </section>
    </>
  )
}
