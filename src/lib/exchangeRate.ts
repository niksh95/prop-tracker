import axios from 'axios'
import { prisma } from '@/lib/prisma'

const MIN_RATE_DATE = '2026-03-15'
const PRIMARY_RATE_HOST = 'https://api.frankfurter.app'
const FALLBACK_RATE_HOST = 'https://api.exchangerate.host'
const prismaExchangeRate = prisma as unknown as {
  exchangeRate: {
    findUnique(args: any): Promise<{ rate: number } | null>
    create(args: any): Promise<any>
  }
}

function normalizeDateInput(date?: string) {
  const source = date ? new Date(date) : new Date()
  return new Date(Date.UTC(source.getUTCFullYear(), source.getUTCMonth(), source.getUTCDate()))
}

function formatDate(date: Date) {
  return date.toISOString().split('T')[0]
}

async function fetchFrankfurterRate(date: Date) {
  const dateString = formatDate(date)
  const response = await axios.get(`${PRIMARY_RATE_HOST}/${dateString}`, {
    params: { from: 'USD', to: 'INR' }
  })
  const rate = response.data?.rates?.INR
  if (typeof rate !== 'number') {
    throw new Error('Frankfurter lookup failed')
  }
  return rate
}

async function fetchFallbackRate(date: Date) {
  const dateString = formatDate(date)
  const url = dateString === formatDate(new Date())
    ? `${FALLBACK_RATE_HOST}/latest?base=USD&symbols=INR`
    : `${FALLBACK_RATE_HOST}/${dateString}?base=USD&symbols=INR`

  const response = await axios.get(url)
  const rate = response.data?.rates?.INR
  if (typeof rate !== 'number') {
    throw new Error('Fallback rate lookup failed')
  }
  return rate
}

async function fetchUsdInrRate(date: Date) {
  try {
    return await fetchFrankfurterRate(date)
  } catch (error) {
    return await fetchFallbackRate(date)
  }
}

export async function getUsdInrRate(date?: string) {
  const normalizedDate = normalizeDateInput(date)
  const dateString = formatDate(normalizedDate)

  if (dateString < MIN_RATE_DATE) {
    throw new Error(`Rates before ${MIN_RATE_DATE} are unavailable`)
  }

  const cachedRate = await prismaExchangeRate.exchangeRate.findUnique({
    where: { date: normalizedDate }
  })
  if (cachedRate) {
    return cachedRate.rate
  }

  const rate = await fetchUsdInrRate(normalizedDate)
  await prismaExchangeRate.exchangeRate.create({
    data: {
      date: normalizedDate,
      rate
    }
  })
  return rate
}
