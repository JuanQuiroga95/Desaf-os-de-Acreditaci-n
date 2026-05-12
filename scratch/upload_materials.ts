import { put } from '@vercel/blob';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function uploadFolder(subjectId: string, folderPath: string, materialType: 'EXERCISE' | 'THEORY') {
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

main().catch(console.error).finally(() => prisma.$disconnect());
