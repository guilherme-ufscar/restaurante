import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️  Limpando banco de dados...')
  
  // Limpar dados existentes
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.review.deleteMany()
  await prisma.product.deleteMany()
  await prisma.restaurantPaymentMethod.deleteMany()
  await prisma.restaurant.deleteMany()
  await prisma.address.deleteMany()
  await prisma.user.deleteMany()
  await prisma.category.deleteMany()
  await prisma.paymentMethod.deleteMany()
  await prisma.subscriptionPlan.deleteMany()

  console.log('✅ Dados limpos!')

  // Criar planos
  console.log('📋 Criando planos de assinatura...')
  const planoBasico = await prisma.subscriptionPlan.create({
    data: {
      name: 'Plano Básico',
      description: 'Ideal para começar',
      price: 99.90,
      interval: 'MONTHLY',
      features: ['Até 50 produtos', 'Até 100 pedidos/mês', 'Suporte por email'],
      maxProducts: 50,
      maxOrders: 100,
      isActive: true,
    },
  })

  const planoProfissional = await prisma.subscriptionPlan.create({
    data: {
      name: 'Plano Profissional',
      description: 'Para restaurantes estabelecidos',
      price: 199.90,
      interval: 'MONTHLY',
      features: ['Produtos ilimitados', 'Pedidos ilimitados', 'Suporte prioritário', 'Destaque na plataforma'],
      isActive: true,
    },
  })

  console.log('✅ Planos criados!')

  // Criar categorias
  console.log('🏷️  Criando categorias...')
  await prisma.category.createMany({
    data: [
      { name: 'Pizza', slug: 'pizza', isActive: true },
      { name: 'Hamburguer', slug: 'hamburguer', isActive: true },
      { name: 'Japonesa', slug: 'japonesa', isActive: true },
      { name: 'Italiana', slug: 'italiana', isActive: true },
      { name: 'Brasileira', slug: 'brasileira', isActive: true },
      { name: 'Saudável', slug: 'saudavel', isActive: true },
      { name: 'Sobremesas', slug: 'sobremesas', isActive: true },
      { name: 'Cafeteria', slug: 'cafeteria', isActive: true },
    ],
  })

  const categorias = await prisma.category.findMany()
  const categoriaPizza = categorias.find(c => c.slug === 'pizza')!
  const categoriaHamburguer = categorias.find(c => c.slug === 'hamburguer')!
  const categoriaJaponesa = categorias.find(c => c.slug === 'japonesa')!

  console.log('✅ Categorias criadas!')

  // Criar métodos de pagamento
  console.log('💳 Criando métodos de pagamento...')
  await prisma.paymentMethod.createMany({
    data: [
      { name: 'Dinheiro', isActive: true },
      { name: 'Cartão de Crédito', isActive: true },
      { name: 'Cartão de Débito', isActive: true },
      { name: 'PIX', isActive: true },
    ],
  })

  const metodos = await prisma.paymentMethod.findMany()
  console.log('✅ Métodos de pagamento criados!')

  // Criar usuários
  console.log('👥 Criando usuários...')
  const hashedPassword = await bcrypt.hash('123456', 10)

  const admin = await prisma.user.create({
    data: {
      email: 'admin@deliveryapp.com',
      name: 'Administrador',
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  })

  const cliente1 = await prisma.user.create({
    data: {
      email: 'cliente@example.com',
      name: 'João Silva',
      password: hashedPassword,
      role: 'USER',
      emailVerified: new Date(),
    },
  })

  const donoPizzaria = await prisma.user.create({
    data: {
      email: 'pizzaria@example.com',
      name: 'Marcos Pizzaiolo',
      password: hashedPassword,
      role: 'RESTAURANT',
      emailVerified: new Date(),
    },
  })

  const donoBurguer = await prisma.user.create({
    data: {
      email: 'burguer@example.com',
      name: 'Lucas Burguer',
      password: hashedPassword,
      role: 'RESTAURANT',
      emailVerified: new Date(),
    },
  })

  const donoSushi = await prisma.user.create({
    data: {
      email: 'sushi@example.com',
      name: 'Ana Takahashi',
      password: hashedPassword,
      role: 'RESTAURANT',
      emailVerified: new Date(),
    },
  })

  console.log('✅ Usuários criados!')

  // Criar restaurantes
  console.log('🍽️  Criando restaurantes...')
  
  const dataExpiracao = new Date()
  dataExpiracao.setDate(dataExpiracao.getDate() + 30)

  const pizzaria = await prisma.restaurant.create({
    data: {
      name: 'Pizzaria Bella Napoli',
      slug: 'pizzaria-bella-napoli',
      description: 'A melhor pizza da cidade com massa artesanal',
      email: 'pizzaria@example.com',
      phone: '(11) 98765-4321',
      ownerId: donoPizzaria.id,
      categoryId: categoriaPizza.id,
      minOrderValue: 30,
      deliveryFee: 8.90,
      estimatedDeliveryTime: 45,
      isActive: true,
      isApproved: true,
      approvedAt: new Date(),
      subscriptionStatus: 'ACTIVE',
      subscriptionPlanId: planoBasico.id,
      subscriptionExpiresAt: dataExpiracao,
      rating: 4.8,
      totalReviews: 342,
      opensAt: '18:00',
      closesAt: '23:30',
      acceptsPickup: true,
      acceptsDelivery: true,
    },
  })

  const burgueria = await prisma.restaurant.create({
    data: {
      name: 'Burger House',
      slug: 'burger-house',
      description: 'Hambúrgueres artesanais e suculentos',
      email: 'burguer@example.com',
      phone: '(11) 98765-1234',
      ownerId: donoBurguer.id,
      categoryId: categoriaHamburguer.id,
      minOrderValue: 25,
      deliveryFee: 7.50,
      estimatedDeliveryTime: 35,
      isActive: true,
      isApproved: true,
      approvedAt: new Date(),
      subscriptionStatus: 'ACTIVE',
      subscriptionPlanId: planoProfissional.id,
      subscriptionExpiresAt: dataExpiracao,
      rating: 4.9,
      totalReviews: 567,
      opensAt: '11:00',
      closesAt: '23:00',
      acceptsPickup: true,
      acceptsDelivery: true,
    },
  })

  const sushiPlace = await prisma.restaurant.create({
    data: {
      name: 'Sushi Premium',
      slug: 'sushi-premium',
      description: 'Culinária japonesa autêntica',
      email: 'sushi@example.com',
      phone: '(11) 98765-5678',
      ownerId: donoSushi.id,
      categoryId: categoriaJaponesa.id,
      minOrderValue: 40,
      deliveryFee: 12.00,
      estimatedDeliveryTime: 50,
      isActive: true,
      isApproved: true,
      approvedAt: new Date(),
      subscriptionStatus: 'ACTIVE',
      subscriptionPlanId: planoProfissional.id,
      subscriptionExpiresAt: dataExpiracao,
      rating: 4.7,
      totalReviews: 289,
      opensAt: '11:30',
      closesAt: '22:30',
      acceptsPickup: true,
      acceptsDelivery: true,
    },
  })

  console.log('✅ Restaurantes criados!')

  // Adicionar métodos de pagamento aos restaurantes
  console.log('💰 Vinculando métodos de pagamento...')
  for (const metodo of metodos) {
    await prisma.restaurantPaymentMethod.create({
      data: { restaurantId: pizzaria.id, paymentMethodId: metodo.id },
    })
    await prisma.restaurantPaymentMethod.create({
      data: { restaurantId: burgueria.id, paymentMethodId: metodo.id },
    })
    await prisma.restaurantPaymentMethod.create({
      data: { restaurantId: sushiPlace.id, paymentMethodId: metodo.id },
    })
  }

  // Criar produtos
  console.log('🍕 Criando produtos...')
  await prisma.product.createMany({
    data: [
      // Pizzas
      { name: 'Pizza Margherita', description: 'Molho de tomate, mussarela, manjericão', price: 45.90, category: 'Pizzas Tradicionais', restaurantId: pizzaria.id, isAvailable: true, preparationTime: 30 },
      { name: 'Pizza Calabresa', description: 'Calabresa, cebola, azeitonas', price: 42.90, category: 'Pizzas Tradicionais', restaurantId: pizzaria.id, isAvailable: true, preparationTime: 30 },
      { name: 'Pizza Quatro Queijos', description: 'Mussarela, parmesão, gorgonzola, catupiry', price: 49.90, category: 'Pizzas Especiais', restaurantId: pizzaria.id, isAvailable: true, preparationTime: 30 },
      { name: 'Refrigerante 2L', description: 'Coca-Cola, Guaraná ou Fanta', price: 12.90, category: 'Bebidas', restaurantId: pizzaria.id, isAvailable: true },
      
      // Burguers
      { name: 'Burger Clássico', description: '180g de carne, queijo, alface, tomate', price: 28.90, category: 'Burgers', restaurantId: burgueria.id, isAvailable: true, preparationTime: 25 },
      { name: 'Burger Bacon', description: '180g de carne, bacon, queijo cheddar', price: 32.90, category: 'Burgers', restaurantId: burgueria.id, isAvailable: true, preparationTime: 25 },
      { name: 'Burger Duplo', description: '2x 180g de carne, queijo, bacon', price: 39.90, discountPrice: 34.90, category: 'Burgers Especiais', restaurantId: burgueria.id, isAvailable: true, preparationTime: 30 },
      { name: 'Batata Frita Grande', description: 'Batata crocante com molhos', price: 15.90, category: 'Acompanhamentos', restaurantId: burgueria.id, isAvailable: true, preparationTime: 15 },
      
      // Sushi
      { name: 'Combinado 30 Peças', description: 'Variado de sushis e sashimis', price: 89.90, category: 'Combinados', restaurantId: sushiPlace.id, isAvailable: true, preparationTime: 40 },
      { name: 'Hot Roll Salmão', description: '10 unidades empanadas', price: 35.90, category: 'Hot Rolls', restaurantId: sushiPlace.id, isAvailable: true, preparationTime: 25 },
      { name: 'Temaki Salmão', description: 'Cone de alga com salmão', price: 24.90, category: 'Temakis', restaurantId: sushiPlace.id, isAvailable: true, preparationTime: 15 },
    ],
  })

  console.log('✅ Produtos criados!')

  console.log('\n🎉 Seed concluído com sucesso!')
  console.log('\n📊 Resumo:')
  console.log(`   - ${await prisma.category.count()} categorias`)
  console.log(`   - ${await prisma.restaurant.count()} restaurantes`)
  console.log(`   - ${await prisma.product.count()} produtos`)
  console.log(`   - ${await prisma.user.count()} usuários`)
  console.log('\n🔑 Credenciais de teste:')
  console.log('   Admin: admin@deliveryapp.com / 123456')
  console.log('   Cliente: cliente@example.com / 123456')
  console.log('   Restaurantes: pizzaria@example.com / 123456')
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })