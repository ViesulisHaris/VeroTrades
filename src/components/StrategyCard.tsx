'use client';

import { useState, useEffect } from 'react';   // <-- FIXED: import useEffect
import { supabase } from '../../supabase/client';
import { formatCurrency } from '@/lib/utils';
import { Trash2 } from 'lucide-react';

interface Trade {
  pnl: number | null;
}

interface Props {
  strategy: {
    id: string;
    name: string;
    rules?: string[];
  };
  onDelete?: () => void;
}

export default function StrategyCard({ strategy, onDelete }: Props) {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalPnL: 0,
    winrate: '0',
    profitFactor: '0',
    trades: 0,
  });

  // -------------------------------------------------
  // Load stats for this strategy
  // -------------------------------------------------
  useEffect(() => {
    const fetchStats = async () => {
      const { data: trades } = await supabase
        .from('trades')
        .select('pnl')
        .eq('strategy_id', strategy.id);

      const pnls: number[] = (trades as Trade[] | null)?.map((t) => t.pnl ?? 0) ?? [];

      const totalPnL = pnls.reduce((a, b) => a + b, 0);
      const wins = pnls.filter((p) => p > 0).length;
      const winrate = pnls.length ? ((wins / pnls.length) * 100).toFixed(1) : '0';

      const grossProfit = pnls.filter((p) => p > 0).reduce((a, b) => a + b, 0);
      const grossLoss = pnls.filter((p) => p < 0).reduce((a, b) => a + b, 0);
      const profitFactor =
        grossLoss === 0
          ? grossProfit > 0
            ? 'Infinite'
            : '0'
          : (grossProfit / Math.abs(grossLoss)).toFixed(2);

      setStats({
        totalPnL,
        winrate,
        profitFactor,
        trades: pnls.length,
      });
    };

    fetchStats();
  }, [strategy.id]);

  // -------------------------------------------------
  // Delete handler
  // -------------------------------------------------
  const handleDelete = async () => {
    if (!confirm('Delete strategy?')) return;
    setLoading(true);
    const { error } = await supabase.from('strategies').delete().eq('id', strategy.id);
    if (error) {
      alert(error.message);
    } else {
      onDelete?.();
    }
    setLoading(false);
  };

  return (
    <div className="glass p-5 relative">
      {/* Delete button */}
      <button
        onClick={handleDelete}
        disabled={loading}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-red-500/20 text-red-400 transition"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {/* Title */}
      <h3 className="text-lg font-semibold mb-2 text-metallic-silver">
        {strategy.name}
      </h3>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-metallic-dark">Winrate:</span> {stats.winrate}%
        </div>
        <div>
          <span className="text-metallic-dark">Profit Factor:</span>{' '}
          {stats.profitFactor}
        </div>
        <div>
          <span className="text-metallic-dark">Net PnL:</span>{' '}
          {formatCurrency(stats.totalPnL)}
        </div>
        <div>
          <span className="text-metallic-dark">Trades:</span> {stats.trades}
        </div>
      </div>

      {/* Rules (optional) */}
      {strategy.rules && strategy.rules.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-metallic-dark mb-1">Rules:</p>
          <ul className="list-disc list-inside text-xs text-metallic-light space-y-1">
            {strategy.rules.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
