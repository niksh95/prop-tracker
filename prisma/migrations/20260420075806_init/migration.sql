-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "propFirmType" TEXT NOT NULL DEFAULT 'futures',
    "amountUSD" REAL NOT NULL,
    "amountINR" REAL NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "propFirm" TEXT NOT NULL,
    "notes" TEXT,
    "bankingCost" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Transaction" ("amountINR", "amountUSD", "bankingCost", "createdAt", "date", "id", "notes", "propFirm", "type", "updatedAt") SELECT "amountINR", "amountUSD", "bankingCost", "createdAt", "date", "id", "notes", "propFirm", "type", "updatedAt" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
