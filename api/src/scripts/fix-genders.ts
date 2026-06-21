import prisma from '../config/database';

async function main() {
  console.log('🔄 Corrigiendo géneros de los usuarios principales en la base de datos...');

  const updates = [
    { email: 'admin@ehr-system.com', sex: 'female', name: 'Xochilt Clara Villar Diego' },
    { email: 'edgar.tiburcio@ehr-system.com', sex: 'male', name: 'Edgar Tiburcio Gomez Moran' },
    { email: 'orlando.casas@ehr-system.com', sex: 'male', name: 'Orlando de Jesus Casas Davila' },
    { email: 'carlos.rodriguez@ehr-system.com', sex: 'male', name: 'Carlos Alexis Rodriguez Garcia' },
    { email: 'daniela.guevara@ehr-system.com', sex: 'female', name: 'Daniela Mayte Guevara Castillo' }
  ];

  for (const u of updates) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: u.email }
      });

      if (user) {
        await prisma.user.update({
          where: { email: u.email },
          data: { sex: u.sex }
        });
        console.log(`✅ Género de ${u.name} (${u.email}) actualizado a "${u.sex}".`);
      } else {
        console.log(`⚠️ Usuario ${u.name} (${u.email}) no encontrado en la base de datos.`);
      }
    } catch (error) {
      console.error(`❌ Error al actualizar a ${u.name} (${u.email}):`, error);
    }
  }

  console.log('✨ Proceso de corrección de géneros finalizado.');
  process.exit(0);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
