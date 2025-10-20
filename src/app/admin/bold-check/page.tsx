import { getRecentBoldEvents } from '@/lib/orders'

import { BoldTester } from './tester'

export default async function BoldCheckPage() {
  const events = getRecentBoldEvents()

  return (
    <main className="flex min-h-[80vh] flex-col gap-6 bg-slate-50 px-6 py-10">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Bold · Checker</h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-600">
          Genera firmas de integridad y valida eventos recibidos desde el webhook de Bold para
          pruebas manuales.
        </p>
      </header>
      <BoldTester initialEvents={events} />
    </main>
  )
}
