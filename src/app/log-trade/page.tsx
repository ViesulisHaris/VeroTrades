'use client';

import TradeForm from '@/components/TradeForm';
import { useRouter } from 'next/navigation';

export default function LogTradePage() {
  const router = useRouter();

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">
        Log New Trade
      </h2>
      <TradeForm onSuccess={() => router.push('/dashboard')} />
    </div>
  );
}
