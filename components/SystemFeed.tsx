import React, { useEffect, useRef } from 'react';
import { SystemLogEntry } from '../types';

interface Props {
  logs: SystemLogEntry[];
}

const SystemFeed: React.FC<Props> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-black/40 border-t border-gray-800 h-48 flex flex-col font-mono text-sm">
      <div className="bg-gray-900/80 px-4 py-1 text-xs text-gray-500 uppercase tracking-widest border-b border-gray-800">
        System Log
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
        {logs.map((log) => (
            <div key={log.id} className={`flex gap-3 ${
                log.type === 'gain' ? 'text-green-400' :
                log.type === 'alert' ? 'text-red-400' :
                log.type === 'narrative' ? 'text-system-cyan italic' :
                'text-gray-400'
            }`}>
                <span className="opacity-50 text-xs mt-0.5">[{log.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit' })}]</span>
                <span>{log.message}</span>
            </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default SystemFeed;
