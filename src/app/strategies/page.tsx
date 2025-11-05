import StrategyCard from '@/components/StrategyCard';
import Link from 'next/link';
import { supabase } from '../../../supabase/client';

export default async function StrategiesPage() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: strategies } = await supabase
    .from('strategies')
    .select('*')
    .eq('user_id', user.id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          Strategies
        </h2>
        <Link
          href="/strategies/create"
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          + Create Strategy
        </Link>
      </div>

      {strategies?.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {strategies.map((s) => (
            <StrategyCard key={s.id} strategy={s} />
          ))}
        </div>
      ) : (
        <p className="text-gray-600 dark:text-gray-400">
          No strategies yet. Create your first one!
        </p>
      )}
    </div>
  );
}
