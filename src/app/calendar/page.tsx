'use client';

import { useState, useEffect } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  parseISO,
} from 'date-fns';
import { supabase } from '../../../supabase/client';
import TradeModal from '@/components/TradeModal';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import Link from 'next/link';

interface Trade {
  id: string;
  symbol: string;
  side: string;
  quantity: number;
  pnl: number | null;
  market: string;
  emotional_state: string;
  stop_loss?: number | null;
  take_profit?: number | null;
  entry_time?: string | null;
  exit_time?: string | null;
  trade_date: string;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [trades, setTrades] = useState<Trade[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<Trade | { multiple: Trade[] } | null>(null);
  const [loading, setLoading] = useState(true);

  // -------------------------------------------------
  // Load trades for the current month
  // -------------------------------------------------
  useEffect(() => {
    const fetchTrades = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const start = format(startOfMonth(currentDate), 'yyyy-MM-dd');
      const end = format(endOfMonth(currentDate), 'yyyy-MM-dd');

      const { data } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .gte('trade_date', start)
        .lte('trade_date', end)
        .order('trade_date', { ascending: true });

      setTrades((data as Trade[]) ?? []);
      setLoading(false);
    };

    fetchTrades();
  }, [currentDate]);

  // -------------------------------------------------
  // Build days → trades map
  // -------------------------------------------------
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const tradesByDate = trades.reduce<Record<string, Trade[]>>((acc, trade) => {
    const key = trade.trade_date; // already YYYY-MM-DD
    if (!acc[key]) acc[key] = [];
    acc[key].push(trade);
    return acc;
  }, {});

  // -------------------------------------------------
  // Click handler
  // -------------------------------------------------
  const handleDateClick = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayTrades = tradesByDate[dateStr] ?? [];

    if (dayTrades.length === 1) {
      setSelectedTrade(dayTrades[0]);
    } else if (dayTrades.length > 1) {
      setSelectedTrade({ multiple: dayTrades });
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-metallic-silver flex items-center gap-2">
          <CalendarIcon className="w-8 h-8" />
          Calendar – {format(currentDate, 'MMMM yyyy')}
        </h2>

        <div className="flex gap-2">
          <Link
            href="/log-trade"
            className="glass p-3 rounded-xl hover:bg-primary/20 transition"
          >
            <Plus className="w-5 h-5 text-metallic-silver" />
          </Link>

          {/* Prev / Next month */}
          <button
            onClick={() =>
              setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
            }
            className="glass p-2"
          >
            &lt;
          </button>
          <button
            onClick={() =>
              setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
            }
            className="glass p-2"
          >
            &gt;
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      {loading ? (
        <div className="glass p-8 text-center text-metallic-light">Loading…</div>
      ) : (
        <div className="glass p-6 overflow-x-auto">
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Weekday headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="font-semibold text-metallic-silver py-2">
                {d}
              </div>
            ))}

            {/* Days */}
            {days.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const dayTrades = tradesByDate[dateStr] ?? [];

              // Explicitly typed reducer
              const totalPnL = dayTrades.reduce<number>((sum, t) => sum + (t.pnl ?? 0), 0);
              const isPositive = totalPnL > 0;
              const isNegative = totalPnL < 0;

              return (
                <button
                  key={dateStr}
                  onClick={() => handleDateClick(day)}
                  className={`
                    relative p-2 h-20 rounded-lg transition-all border-2
                    ${isSameDay(day, new Date()) ? 'bg-primary/20 border-primary' : ''}
                    ${isPositive ? 'border-green-400/50 bg-green-500/10' : ''}
                    ${isNegative ? 'border-red-400/50 bg-red-500/10' : 'border-metallic-dark/20 bg-white/5'}
                  `}
                >
                  <div className="text-sm font-medium text-metallic-light">
                    {format(day, 'd')}
                  </div>

                  {dayTrades.length > 0 && (
                    <div
                      className={`text-xs mt-1 ${
                        isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-metallic-light'
                      }`}
                    >
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 2,
                      }).format(totalPnL)}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Trade detail modal */}
      {selectedTrade && (
        <TradeModal trade={selectedTrade} onClose={() => setSelectedTrade(null)} />
      )}
    </div>
  );
}
