import DashboardCard from '@/components/DashboardCard';
import EmotionPie from '@/components/EmotionPie';
import { supabase } from '../../../supabase/client';
import { formatCurrency } from '@/lib/utils';

async function getStats(userId: string) {
  const { data: trades } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', userId);

  const totalPnL = trades?.reduce((s, t) => s + (t.pnl || 0), 0) ?? 0;
  const wins = trades?.filter(t => (t.pnl ?? 0) > 0).length ?? 0;
  const total = trades?.length ?? 0;
  const winrate = total ? ((wins / total) * 100).toFixed(1) : '0';
  const profitFactor =
    trades?.reduce((s, t) => s + Math.max(0, t.pnl ?? 0), 0) /
      Math.abs(trades?.reduce((s, t) => s + Math.min(0, t.pnl ?? 0), 0) || 1) ?? 0;

  const emotions = trades?.reduce((acc, t) => {
    const e = t.emotional_state || 'Neutral';
    acc[e] = (acc[e] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) ?? {};

  return { totalPnL, winrate, profitFactor: profitFactor.toFixed(2), emotions };
}

export default async function DashboardPage() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { totalPnL, winrate, profitFactor, emotions } = await getStats(user.id);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
        Dashboard
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard title="Total PnL" value={formatCurrency(totalPnL)} />
        <DashboardCard title="Winrate" value={`${winrate}%`} />
        <DashboardCard title="Profit Factor" value={profitFactor} />
        <DashboardCard title="Total Trades" value={(await supabase.from('trades').select('*', { count: 'exact', head: true }).eq('user_id', user.id)).count?.toString() ?? '0'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Emotional State</h3>
          <EmotionPie data={Object.entries(emotions).map(([label, value]) => ({
            name: label,
            value,
            percent: ((value / Object.values(emotions).reduce((a, b) => a + b, 0)) * 100).toFixed(1) + '%',
          }))} />
        </div>
      </div>
    </div>
  );
}
