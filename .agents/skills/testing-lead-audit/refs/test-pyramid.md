# Test Pyramid Reference

## Estrutura

```
        /\
       /E2E\
      /-----\
     / API   \
    / Contract\
   /-----------\
  / Integration \
 /    (with BD,  \
/     Redis, etc) \
-------/--------\-------
/       Unit      \
/ (isolated, fast) \
/-------------------\
```

## Distribuição Recomendada

| Tipo | % | Velocidade | Escopo |
|------|---|-----------|--------|
| Unit | 70% | < 10ms | Função isolada |
| Integration | 20% | 100ms-1s | Função + BD/Cache/Serviço |
| E2E/Contract | 10% | 1s+ | Fluxo completo ou contrato |

## Exemplos

### Unit Test
```typescript
describe('calculatePrice', () => {
  it('should apply 10% discount for qty > 100', () => {
    expect(calculatePrice(150, 10)).toBe(135);
  });
});
```

### Integration Test
```typescript
describe('OrderService', () => {
  it('should create order with items in database', async () => {
    const order = await orderService.create({ items: [...] });
    expect(order.id).toBeDefined();
    const saved = await db.order.findUnique({ where: { id: order.id } });
    expect(saved).toEqual(order);
  });
});
```

### Contract Test
```typescript
describe('GET /api/orders/:id', () => {
  it('should return order with correct schema', async () => {
    const res = await request(app).get('/api/orders/1');
    expect(res.status).toBe(200);
    expect(res.body).toMatchSchema(OrderSchema);
  });
});
```

## Red Flags

- Mais de 30% de testes sendo E2E (muito lento)
- Menos de 50% de unitários (cobertura superficial)
- Integração ausente (BD não está sendo testada)
