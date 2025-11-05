import { supabase } from '../../supabase/client';
import { formatCurrency } from '@/lib/utils';

interface Props {
  strategy: any;
}

export default async function StrategyCard({ strategy }: Props) {
  const { data: trades } = await supabase
    .from('trades')
    .select('pnl')
    .eq('strategy_id', strategy.id);

  const pnls = trades?.map((t) => t.pnl ?? 0) ?? [];
  const totalPnL = pnls.reduce((a, b) => a + b, 0);
  const wins = pnls.filter((p) => p > 0).length;
  const winrate = pnls.length ? ((wins / pnls.length) * 100).toFixed(1) : '0';
  const profitFactor =
    pnls.filter((p) => p > 0).reduce((a, b) => a + b, 0) /
    Math.abs(pnls.filter((p) => p < 0).reduce((a, b) => a + b, 0) || 1);

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">{strategy.name}</h3>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-500 dark:text-gray-400">Winrate:</span>{' '}
          {winrate}%
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Profit Factor:</span>{' '}
          {profitFactor.toFixed(2)}
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Net PnL:</span>{' '}
          {formatCurrency(totalPnL)}
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Trades:</span>{' '}
          {pnls.length}
        </div>
      </div>

      {strategy.rules && strategy.rules.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Rules:
          </p>
          <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-400">
            {strategy.rules.map((r: string, i: number) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
