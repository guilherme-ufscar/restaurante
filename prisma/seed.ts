import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10)

  const admin = await prisma.user.upsert({
    where: { email: "admin@fooddelivery.com" },
    update: {},
    create: {
      email: "admin@fooddelivery.com",
      name: "Administrador",
      password: hashedPassword,
      role: "ADMIN"
    }
  })
  console.log("Usuário admin criado:", admin.email)

  const categories = [
    "Pizza", "Hamburguer", "Japonesa", "Italiana", "Bebidas", "Sobremesas"
  ]

  for (const name of categories) {
    const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: {
        name,
        slug,
        isActive: true
      }
    })
  }
  console.log("Categorias criadas")

  const paymentMethods = [
    "Dinheiro", "Cartão de Crédito", "Cartão de Débito", "PIX"
  ]

  for (const name of paymentMethods) {
    await prisma.paymentMethod.upsert({
      where: { name },
      update: {},
      create: {
        name,
        isActive: true
      }
    })
  }
  console.log("Métodos de pagamento criados")

  const plans = [
    {
      name: "Básico",
      description: "Para quem está começando",
      price: 89.90,
      interval: "MONTHLY",
      features: ["Até 50 produtos", "Até 100 pedidos/mês", "Suporte por email"],
      maxProducts: 50,
      maxOrders: 100
    },
    {
      name: "Profissional",
      description: "Para restaurantes em crescimento",
      price: 99.90,
      interval: "MONTHLY",
      features: ["Produtos ilimitados", "Pedidos ilimitados", "Suporte prioritário", "Dashboard analítico"],
      maxProducts: null,
      maxOrders: null
    }
  ]

  for (const plan of plans) {
    // Check if plan exists by name since name is not unique in schema but we want to avoid dups
    const existing = await prisma.subscriptionPlan.findFirst({
      where: { name: plan.name }
    })

    if (!existing) {
      await prisma.subscriptionPlan.create({
        data: {
          name: plan.name,
          description: plan.description,
          price: plan.price,
          interval: plan.interval as any,
          features: plan.features,
          maxProducts: plan.maxProducts,
          maxOrders: plan.maxOrders,
          isActive: true
        }
      })
    }
  }
  console.log("Planos de assinatura criados")

  // Create Restaurant Owner
  const restaurantOwnerPassword = await bcrypt.hash("loja123", 10)
  const restaurantOwner = await prisma.user.upsert({
    where: { email: "loja@fooddelivery.com" },
    update: {},
    create: {
      email: "loja@fooddelivery.com",
      name: "Dono da Loja",
      password: restaurantOwnerPassword,
      role: "RESTAURANT"
    }
  })
  console.log("Usuário dono de loja criado:", restaurantOwner.email)

  // Get dependencies for restaurant
  const category = await prisma.category.findFirst({
    where: { slug: "hamburguer" }
  })

  const plan = await prisma.subscriptionPlan.findFirst({
    where: { name: "Profissional" }
  })

  if (category && plan) {
    await prisma.restaurant.upsert({
      where: { slug: "burger-king-test" },
      update: {},
      create: {
        name: "Burger King Teste",
        slug: "burger-king-test",
        description: "O melhor hambúrguer da cidade (Loja de Teste)",
        email: "contato@bkteste.com",
        phone: "11999999999",
        ownerId: restaurantOwner.id,
        categoryId: category.id,
        minOrderValue: 15.00,
        deliveryFee: 5.00,
        estimatedDeliveryTime: 45,
        isActive: true,
        isApproved: true,
        subscriptionStatus: "ACTIVE",
        subscriptionPlanId: plan.id,
        opensAt: "10:00",
        closesAt: "23:00"
      }
    })

    console.log("Restaurante de teste criado")

    // Link payment methods to restaurant
    const allPaymentMethods = await prisma.paymentMethod.findMany()

    for (const pm of allPaymentMethods) {
      await prisma.restaurantPaymentMethod.upsert({
        where: {
          restaurantId_paymentMethodId: {
            restaurantId: restaurantOwner.id ? (await prisma.restaurant.findUnique({ where: { slug: "burger-king-test" } }))!.id : "", // Safer way to get ID if needed, but we can reuse the result if we capturing it properly. 
            // Actually, let's just use the result from the upsert above. 
            // Wait, I can't easily capture the result of the upsert cleanly without changing the variable scope or chaining. 
            // Let's just fetch it since we know the slug.
            paymentMethodId: pm.id
          }
        },
        update: {},
        create: {
          restaurantId: (await prisma.restaurant.findUnique({ where: { slug: "burger-king-test" } }))!.id,
          paymentMethodId: pm.id,
          isActive: true
        }
      })
    }
    console.log("Métodos de pagamento vinculados ao restaurante")
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })