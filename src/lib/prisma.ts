import { PrismaClient } from '@prisma/client'
import fs from 'node:fs'
import path from 'node:path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function resolveDatasourceUrl() {
  if (!process.env.VERCEL) {
    return undefined
  }

  const runtimeDbPath = '/tmp/prop-tracker.db'
  const bundledDbPath = path.join(process.cwd(), 'prisma', 'dev.db')

  try {
    if (!fs.existsSync(runtimeDbPath)) {
      if (fs.existsSync(bundledDbPath)) {
        fs.copyFileSync(bundledDbPath, runtimeDbPath)
      } else {
        fs.closeSync(fs.openSync(runtimeDbPath, 'a'))
      }
    }
  } catch (error) {
    console.error('Failed to initialize writable SQLite DB at /tmp:', error)
  }

  return `file:${runtimeDbPath}`
}

const datasourceUrl = resolveDatasourceUrl()

export const prisma = globalForPrisma.prisma ?? new PrismaClient(
  datasourceUrl
    ? {
        datasources: {
          db: {
            url: datasourceUrl
          }
        }
      }
    : undefined
)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma