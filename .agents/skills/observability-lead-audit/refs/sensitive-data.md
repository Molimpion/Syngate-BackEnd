# Sensitive Data Reference

## O Que NÃO Logar

### NUNCA
- Senhas em plaintext: ❌ `password: user.password`
- API Keys / Tokens: ❌ `apiKey: process.env.STRIPE_KEY`
- Token JWT: ❌ `token: req.headers.authorization`
- PII completo: ❌ `cpf: "123.456.789-00"`
- Credit card full: ❌ `card: "4532015112830366"`

### SEMPRE Sanitizar
```typescript
// ❌ Ruim
logger.error('Auth failed', { email, password, token });

// ✅ Bom
logger.error('Auth failed', { 
  email: maskEmail(email),        // user@***.com
  passwordLength: password?.length, // 12
  tokenHash: hashToken(token),    // sha256(token)
});
```

## Masking Utilities

```typescript
function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  return `${local[0]}***@${domain}`;
}

function maskCardNumber(card: string): string {
  return `****-****-****-${card.slice(-4)}`;
}

function maskCPF(cpf: string): string {
  return `${cpf.slice(0, 3)}***-***-${cpf.slice(-2)}`;
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
```

## Sentry / Log Aggregation

```typescript
import * as Sentry from '@sentry/node';

// Filtrar dados sensíveis antes de enviar
Sentry.init({
  // ...
  beforeSend(event) {
    if (event.request?.headers?.authorization) {
      delete event.request.headers.authorization;
    }
    return event;
  },
});
```

## LGPD / GDPR

- Deletar logs com PII após X dias
- Anonimizar IPs
- Desabilitar logging de dados sensíveis em produção
- Validar conformidade com DPO

## Checklist

- [ ] Nenhuma senha em log
- [ ] Nenhum token em log
- [ ] PII apenas quando necessário (e mascarado)
- [ ] Credit card apenas últimos 4 dígitos
- [ ] Configurar retenção de log
- [ ] Testar com dados reais em staging
