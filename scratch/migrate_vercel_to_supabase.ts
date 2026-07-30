import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function migrate() {
  console.log("Iniciando migración de Vercel Blob a Supabase Storage...");
  
  // Buscar materiales con URL de vercel blob
  const materiales = await prisma.material.findMany({
    where: {
      fileUrl: {
        contains: "public.blob.vercel-storage.com"
      }
    }
  });

  console.log(`Se encontraron ${materiales.length} materiales para migrar.`);

  for (const material of materiales) {
    if (!material.fileUrl) continue;
    try {
      console.log(`Migrando: ${material.title} (${material.fileUrl})`);
      const response = await fetch(material.fileUrl);
      if (!response.ok) {
        console.error(`Error descargando ${material.fileUrl}: ${response.statusText}`);
        continue;
      }
      const buffer = await response.arrayBuffer();
      
      const urlParts = material.fileUrl.split('/');
      const originalName = urlParts[urlParts.length - 1];
      const fileExt = originalName.split('.').pop() || 'pdf';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('materiales')
        .upload(fileName, buffer, {
          contentType: response.headers.get('content-type') || 'application/octet-stream',
          upsert: false
        });

      if (error) {
        console.error(`Error subiendo a Supabase: ${error.message}`);
        continue;
      }

      const { data: publicUrlData } = supabase.storage
        .from('materiales')
        .getPublicUrl(fileName);

      await prisma.material.update({
        where: { id: material.id },
        data: { fileUrl: publicUrlData.publicUrl }
      });

      console.log(`Migrado exitosamente: ${publicUrlData.publicUrl}`);
    } catch (e) {
      console.error(`Excepción al migrar material ${material.id}:`, e);
    }
  }

  // Buscar desafíos (encuentros) con URLs de vercel blob en imageUrls
  const allChallenges = await prisma.challenge.findMany({
    where: {
      imageUrls: {
        isEmpty: false
      }
    }
  });
  
  const challengesToMigrate = allChallenges.filter(c => c.imageUrls.some(url => url.includes("public.blob.vercel-storage.com")));
  console.log(`Se encontraron ${challengesToMigrate.length} encuentros para migrar.`);
  
  for (const challenge of challengesToMigrate) {
     const newImageUrls = [];
     for (const url of challenge.imageUrls) {
        if (url.includes("public.blob.vercel-storage.com")) {
            console.log(`Migrando imagen de encuentro: ${url}`);
            try {
              const response = await fetch(url);
              if (!response.ok) {
                 console.error(`Error descargando ${url}: ${response.statusText}`);
                 newImageUrls.push(url); // Keep old URL if failed
                 continue;
              }
              const buffer = await response.arrayBuffer();
              const urlParts = url.split('/');
              const originalName = urlParts[urlParts.length - 1];
              const fileExt = originalName.split('.').pop() || 'png';
              const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

              const { data, error } = await supabase.storage
                .from('materiales')
                .upload(fileName, buffer, {
                  contentType: response.headers.get('content-type') || 'application/octet-stream'
                });
                
              if (error) {
                 console.error(`Error subiendo a Supabase: ${error.message}`);
                 newImageUrls.push(url);
                 continue;
              }
              
              const { data: publicUrlData } = supabase.storage
                .from('materiales')
                .getPublicUrl(fileName);
                
              newImageUrls.push(publicUrlData.publicUrl);
            } catch (e) {
               console.error(`Excepción al migrar imagen ${url}:`, e);
               newImageUrls.push(url);
            }
        } else {
           newImageUrls.push(url);
        }
     }
     
     await prisma.challenge.update({
        where: { id: challenge.id },
        data: { imageUrls: newImageUrls }
     });
     console.log(`Encuentro ${challenge.id} migrado.`);
  }

  console.log("Migración completada.");
}

migrate().catch(console.error).finally(() => prisma.$disconnect());
