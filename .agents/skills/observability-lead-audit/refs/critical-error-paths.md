# Critical Error Paths Reference

## Operações Críticas

### 1. Pagamentos

```typescript
// ❌ Erro silencioso
async function processPayment(order) {
  try {
    const charge = await stripe.charges.create({...});
    await db.order.update({ ...charge });
  } catch (e) {
    // Silencioso, pedido fica pendente em produção!
  }
}

// ✅ Correto
async function processPayment(order) {
  try {
    logger.info('Processing payment', { orderId: order.id, amount: order.total });
    const charge = await stripe.charges.create({...});
    logger.info('Payment succeeded', { chargeId: charge.id });
    
    await db.order.update({ 
      where: { id: order.id },
      data: { chargeId: charge.id, status: 'paid' }
    });
  } catch (e) {
    logger.error('Payment failed', { 
      orderId: order.id, 
      error: e.message,
      stack: e.stack,
    });
    await db.order.update({ 
      where: { id: order.id },
      data: { status: 'payment_failed' }
    });
    throw e;  // Re-throw para notificar API
  }
}
```

### 2. Autenticação

```typescript
// ❌ Erro não-auditado
async function login(email, password) {
  const user = await db.user.findUnique({ where: { email } });
  if (user && password === user.password) {  // Comparação segura?
    return createToken(user);
  }
  return null;  // Por que falhou? Audit?
}

// ✅ Correto
async function login(email, password) {
  logger.info('Login attempt', { email });
  
  const user = await db.user.findUnique({ where: { email } });
  
  if (!user) {
    logger.warn('Login failed - user not found', { email });
    return null;
  }
  
  const isValid = await bcrypt.compare(password, user.passwordHash);
  
  if (!isValid) {
    logger.warn('Login failed - invalid password', { userId: user.id });
    await db.loginAttempt.create({ userId: user.id, success: false });
    return null;
  }
  
  logger.info('Login succeeded', { userId: user.id });
  await db.loginAttempt.create({ userId: user.id, success: true });
  
  return createToken(user);
}
```

### 3. Banco de Dados

```typescript
// ❌ Sem retry
async function fetchUser(id) {
  try {
    return await db.user.findUnique({ where: { id } });
  } catch (e) {
    logger.error('DB error', { error: e.message });
    throw e;  // Cliente recebe erro 500
  }
}

// ✅ Com retry + graceful degradation
async function fetchUser(id) {
  const maxRetries = 3;
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await db.user.findUnique({ where: { id } });
    } catch (e) {
      lastError = e;
      logger.warn(`DB query retry ${i + 1}/${maxRetries}`, { error: e.message });
      
      if (i < maxRetries - 1) {
        await sleep(100 * (i + 1));  // Exponential backoff
      }
    }
  }
  
  logger.error('DB error after retries', { error: lastError.message, stack: lastError.stack });
  throw new DatabaseError('Failed to fetch user', { userId: id });
}
```

## Checklist

- [ ] Erro em pagamento é loggado + alerta
- [ ] Login failed diferencia (user not found vs invalid password)
- [ ] DB connection errors têm retry logic
- [ ] Transações são atômicas
- [ ] Deadlocks são detectados e reabilitados
- [ ] Webhooks (Stripe, etc) são auditados
