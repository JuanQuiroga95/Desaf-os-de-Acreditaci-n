require('dotenv').config({ path: '.env.local' });
const { put } = require('@vercel/blob');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function uploadFolder(subjectId, folderPath, materialType) {
  if (!fs.existsSync(folderPath)) {
    console.log(`Folder not found: ${folderPath}`);
    return;
  }

  const files = fs.readdirSync(folderPath);
  for (const file of files) {
    if (file.endsWith('.pdf')) {
      const filePath = path.join(folderPath, file);
      const fileBuffer = fs.readFileSync(filePath);
      
      console.log(`Uploading ${file}...`);
      const blob = await put(file, fileBuffer, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN
      });

      console.log(`Uploaded to ${blob.url}, saving to DB...`);
      await prisma.material.create({
        data: {
          type: materialType,
          title: file.replace('.pdf', ''),
          content: 'Material subido automáticamente.',
          fileUrl: blob.url,
          subjectId: subjectId,
          order: 0
        }
      });
    }
  }
}

async function main() {
  const subject = await prisma.subject.findFirst({
    where: { name: { contains: 'Matemática' } }
  });

  if (!subject) {
    console.error('Materia Matemática no encontrada');
    return;
  }

  console.log(`Found subject: ${subject.name} (${subject.id})`);

  const basePath = 'C:\\Users\\Docente\\Desktop\\matematica primer año';
  
  await uploadFolder(subject.id, path.join(basePath, 'Practicos'), 'EXERCISE');
  await uploadFolder(subject.id, path.join(basePath, 'teoria y practica'), 'THEORY');

  console.log('Done!');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
