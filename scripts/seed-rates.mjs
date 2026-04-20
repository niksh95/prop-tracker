import { PrismaClient } from '@prisma/client'
import axios from 'axios'

const prisma = new PrismaClient()

function normalize(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

function formatDate(date) {
  return date.toISOString().split('T')[0]
}

async function fetchRate(date) {
  const dateString = formatDate(date)
  const response = await axios.get(`https://api.frankfurter.app/${dateString}`, {
    params: { from: 'USD', to: 'INR' }
  })
  const rate = response.data?.rates?.INR
  if (typeof rate !== 'number') {
    throw new Error(`Rate lookup failed for ${dateString}`)
  }
  return rate
}

async function main() {
  const start = normalize(new Date('2026-03-15'))
  const end = normalize(new Date())
  let current = new Date(start)

  while (current <= end) {
    const dateString = formatDate(current)
    const existing = await prisma.exchangeRate.findUnique({
      where: { date: current }
    })

    if (existing) {
      console.log(`Skipping ${dateString}`)
    } else {
      console.log(`Fetching ${dateString}`)
      const rate = await fetchRate(current)
      await prisma.exchangeRate.create({
        data: {
          date: current,
          rate
        }
      })
    }

    current.setUTCDate(current.getUTCDate() + 1)
  }

  console.log('Seed complete')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
