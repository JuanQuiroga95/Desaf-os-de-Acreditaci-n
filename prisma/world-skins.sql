-- Skins del Mundo. Se ejecuta en cada build de Vercel: solo agrega, nunca borra,
-- y se puede repetir sin efectos.
BEGIN;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "worldSkin" TEXT;
CREATE TABLE IF NOT EXISTS "OwnedSkin" (
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "skinId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("userId", "skinId")
);
COMMIT;
