# Project Structure Reference

## Padrão de Arquitetura

```
src/
├── config/
│   └── logger.ts           # Configuração do Winston/Pino
├── middleware/
│   ├── error-handler.ts    # Middleware de erro global
│   └── request-context.ts  # RequestId / AsyncLocalStorage
├── modules/
│   ├── users/
│   │   ├── users.service.ts
│   │   └── users.routes.ts
│   └── orders/
│       └── orders.service.ts
└── utils/
    ├── logger.ts           # Helper para logging
    └── error.ts            # Custom error classes
```

## Pattern de Serviço

```typescript
// services/payment.service.ts
export class PaymentService {
  async processPayment(orderId: number) {
    logger.info('Processing payment', { orderId });
    
    try {
      const order = await db.order.findUnique({ where: { id: orderId } });
      const charge = await stripe.charges.create({...});
      logger.info('Payment succeeded', { chargeId: charge.id });
      
      return charge;
    } catch (error) {
      logger.error('Payment failed', {
        orderId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}
```

## Tipos de Erro

```typescript
// utils/errors.ts
export class PaymentError extends Error {
  constructor(message: string, public readonly orderId: number) {
    super(message);
    this.name = 'PaymentError';
  }
}

export class DatabaseError extends Error {
  constructor(message: string, public readonly context: Record<string, any>) {
    super(message);
    this.name = 'DatabaseError';
  }
}
```
