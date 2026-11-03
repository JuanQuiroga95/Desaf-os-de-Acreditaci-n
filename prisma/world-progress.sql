-- Ejecutar una vez antes de publicar el código; no borra ni modifica tablas existentes.
BEGIN;
CREATE TABLE IF NOT EXISTS "GameCompletion" (
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "activityKey" TEXT NOT NULL,
  "itemId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("userId", "activityKey", "itemId")
);
-- Conserva los aciertos anteriores sin volver a pagar monedas.
INSERT INTO "GameCompletion" ("userId", "activityKey", "itemId", "createdAt")
SELECT a."userId", u."activityKey", a."itemId", MIN(a."createdAt")
FROM "ActivityAttempt" a JOIN "UnitActivity" u ON u."id" = a."unitActivityId"
WHERE a."correct" = true
GROUP BY a."userId", u."activityKey", a."itemId"
ON CONFLICT DO NOTHING;
COMMIT;
