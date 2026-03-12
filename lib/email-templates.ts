export const emailTemplates = {
    welcome: (name: string) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Bem-vindo ao DeliveryApp, ${name}!</h1>
      <p>Estamos muito felizes em ter você conosco.</p>
      <p>Explore os melhores restaurantes da sua região e faça seu primeiro pedido.</p>
    </div>
  `,
    orderConfirmed: (orderNumber: string, total: string) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Pedido Confirmado!</h1>
      <p>Seu pedido <strong>#${orderNumber}</strong> foi recebido e está aguardando confirmação do restaurante.</p>
      <p>Total: <strong>${total}</strong></p>
      <p>Você será notificado assim que o restaurante começar a preparar seu pedido.</p>
    </div>
  `,
    orderStatusUpdate: (orderNumber: string, status: string, statusText: string) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Atualização do Pedido #${orderNumber}</h1>
      <p>Seu pedido agora está: <strong style="color: #ea580c; font-size: 1.2em;">${statusText}</strong></p>
      <p>Acompanhe o status em tempo real no app.</p>
    </div>
  `,
    newOrderForRestaurant: (orderNumber: string, total: string) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Novo Pedido #${orderNumber}</h1>
      <p>Você recebeu um novo pedido no valor de <strong>${total}</strong>.</p>
      <p>Acesse o painel do restaurante para aceitar e começar a preparar.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/restaurant/dashboard/orders" style="display: inline-block; background-color: #ea580c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Ver Pedido</a>
    </div>
  `
}
