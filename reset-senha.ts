import bcrypt from 'bcrypt';
import { prisma } from './src/lib/prisma';

async function main() {
  const hash = await bcrypt.hash('Senha@123', 12);
  console.log('Hash gerado:', hash);
  await prisma.usuario.updateMany({
    data: { hashSenha: hash }
  });
  console.log('Todas as senhas atualizadas!');
}

main().finally(() => prisma.$disconnect());
