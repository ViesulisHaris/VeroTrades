'use client';

import { formatCurrency } from '@/lib/utils';
import { X } from 'lucide-react';

interface Props {
  trade: any;
  onClose: () => void;
}

export default function TradeModal({ trade, onClose }: Props) {
  if (trade.multiple) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="glass max-w-md w-full max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center p-4 border-b border-metallic-dark/50">
            <h3 className="text-lg font-semibold text-metallic-silver">Multiple Trades</h3>
            <button onClick={onClose} className="p-1 rounded hover:bg-metallic-dark/20">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 space-y-2">
            {trade.multiple.map((t: any) => (
              <div key={t.id} className="p-3 border rounded-lg border-metallic-dark/30">
                <p className="font-medium">{t.symbol} - {t.side}</p>
                <p className="text-sm text-metallic-light">PnL: {formatCurrency(t.pnl || 0)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass max-w-lg w-full p-6">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded hover:bg-metallic-dark/20">
          <X className="w-5 h-5 text-metallic-silver" />
        </button>
        <h3 className="text-xl font-semibold mb-4 text-metallic-silver">Trade Details</h3>
        <div className="space-y-2 text-metallic-light">
          <p><span className="font-medium">Symbol:</span> {trade.symbol}</p>
          <p><span className="font-medium">Side:</span> {trade.side}</p>
          <p><span className="font-medium">Quantity:</span> {trade.quantity}</p>
          <p><span className="font-medium">PnL:</span> {formatCurrency(trade.pnl || 0)}</p>
          <p><span className="font-medium">Market:</span> {trade.market}</p>
          <p><span className="font-medium">Emotional State:</span> {trade.emotional_state}</p>
          {trade.stop_loss && <p><span className="font-medium">Stop Loss:</span> {trade.stop_loss}</p>}
          {trade.take_profit && <p><span className="font-medium">Take Profit:</span> {trade.take_profit}</p>}
          {trade.entry_time && <p><span className="font-medium">Entry:</span> {trade.entry_time}</p>}
          {trade.exit_time && <p><span className="font-medium">Exit:</span> {trade.exit_time}</p>}
        </div>
      </div>
    </div>
  );
}
