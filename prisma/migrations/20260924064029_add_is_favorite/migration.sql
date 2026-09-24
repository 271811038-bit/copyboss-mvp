-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Copy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "style" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Copy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Copy" ("content", "createdAt", "id", "platform", "style", "userId") SELECT "content", "createdAt", "id", "platform", "style", "userId" FROM "Copy";
DROP TABLE "Copy";
ALTER TABLE "new_Copy" RENAME TO "Copy";
CREATE INDEX "Copy_userId_createdAt_idx" ON "Copy"("userId", "createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
