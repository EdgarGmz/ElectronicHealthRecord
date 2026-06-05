import prisma from '../config/database';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function main() {
  const password = process.argv[2];
  if (!password) {
    console.error('Error: Debes proporcionar la nueva contraseña para el administrador.');
    console.error('Uso: npm run auth:reset-admin "<nueva_contraseña>"');
    process.exit(1);
  }

  try {
    // Find the admin user
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' },
    });

    if (!adminUser) {
      console.error('Error: No se encontró ningún usuario con el rol "admin" (superusuario).');
      process.exit(1);
    }

    const passwordHash = await hashPassword(password);

    await prisma.user.update({
      where: { id: adminUser.id },
      data: {
        passwordHash,
        mustChangePassword: true, // Force the admin to change their password on login
      },
    });

    console.log(`✅ Contraseña del superusuario "${adminUser.username || adminUser.email}" restablecida correctamente.`);
    console.log('Se requerirá cambio de contraseña en el próximo inicio de sesión.');
    process.exit(0);
  } catch (error) {
    console.error('Error al restablecer la contraseña:', error);
    process.exit(1);
  }
}

main();
