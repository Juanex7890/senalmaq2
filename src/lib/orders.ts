import { randomUUID, createHash } from 'crypto'

export type OrderStatus = 'pending' | 'paid' | 'rejected' | 'voided'

type OrderHistoryEntry = {
  status: OrderStatus
  updatedAt: string
}

export type OrderRecord = {
  reference: string
  status: OrderStatus
  updatedAt: string
  history: OrderHistoryEntry[]
  verificationCode: string
  items: string[]
}

export type BoldEventRecord = {
  id: string
  type?: string
  reference?: string
  receivedAt: string
  payload: unknown
}

const MAX_HISTORY = 20
const MAX_EVENTS = 50

const orderStore = new Map<string, OrderRecord>()
const boldEvents: BoldEventRecord[] = []

const normalizeReference = (reference?: string) => reference?.trim() ?? ''

const generateVerificationCode = (reference: string) => {
  const seed = `${reference}-${randomUUID()}`
  const hash = createHash('sha256').update(seed).digest('hex').slice(0, 6).toUpperCase()
  return `SEN-${hash}`
}

const ensureOrderRecord = (reference: string): OrderRecord => {
  const normalized = normalizeReference(reference)
  const existing = orderStore.get(normalized)
  if (existing) {
    return existing
  }

  const now = new Date().toISOString()
  const record: OrderRecord = {
    reference: normalized,
    status: 'pending',
    updatedAt: now,
    history: [{ status: 'pending', updatedAt: now }],
    verificationCode: generateVerificationCode(normalized),
    items: [],
  }

  orderStore.set(normalized, record)
  return record
}

const updateOrderStatus = (reference: string, status: OrderStatus) => {
  const normalized = normalizeReference(reference)
  if (!normalized) {
    return
  }

  const record = ensureOrderRecord(normalized)
  const now = new Date().toISOString()

  record.status = status
  record.updatedAt = now
  record.history.unshift({ status, updatedAt: now })

  if (record.history.length > MAX_HISTORY) {
    record.history.length = MAX_HISTORY
  }

  orderStore.set(normalized, record)
}

export const registerOrderDraft = (reference: string, items?: string[]) => {
  const normalized = normalizeReference(reference)
  if (!normalized) {
    return
  }

  const record = ensureOrderRecord(normalized)
  const now = new Date().toISOString()

  if (Array.isArray(items) && items.length > 0) {
    record.items = items.map(item => item.trim()).filter(Boolean)
  }

  record.updatedAt = now
  orderStore.set(normalized, record)
}

export const recordBoldEvent = (event: {
  type?: string
  reference?: string
  payload: unknown
}) => {
  const entry: BoldEventRecord = {
    id: randomUUID(),
    type: event.type,
    reference: event.reference?.trim(),
    payload: event.payload,
    receivedAt: new Date().toISOString(),
  }

  boldEvents.unshift(entry)
  if (boldEvents.length > MAX_EVENTS) {
    boldEvents.length = MAX_EVENTS
  }
}

export const getRecentBoldEvents = () => [...boldEvents]

export const getOrderStatus = (reference?: string): OrderRecord | undefined => {
  if (!reference) {
    return undefined
  }
  return orderStore.get(reference.trim())
}

export const getOrderByVerificationCode = (code?: string): OrderRecord | undefined => {
  if (!code) {
    return undefined
  }

  const normalized = code.trim().toUpperCase()
  for (const record of orderStore.values()) {
    if (record.verificationCode.toUpperCase() === normalized) {
      return record
    }
  }
  return undefined
}

export async function markOrderPaid(reference?: string): Promise<void> {
  updateOrderStatus(reference ?? '', 'paid')
}

export async function markOrderRejected(reference?: string): Promise<void> {
  updateOrderStatus(reference ?? '', 'rejected')
}

export async function markOrderVoided(reference?: string): Promise<void> {
  updateOrderStatus(reference ?? '', 'voided')
}
