import React from 'react';
import { createPortal } from 'react-dom';
import type { ElevatorViewModel } from '../../../store/elevator-store';
import { ElevatorDetailPanel } from './ElevatorDetailPanel';

function useBodyScrollLock(locked: boolean): void {
  React.useEffect(() => {
    if (!locked) {
      return;
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [locked]);
}

interface ElevatorDetailDrawerProps {
  open: boolean;
  elevator: ElevatorViewModel | undefined;
  onClose: () => void;
}

export function ElevatorDetailDrawer({
  open,
  elevator,
  onClose
}: ElevatorDetailDrawerProps): React.ReactPortal | null {
  useBodyScrollLock(open && Boolean(elevator));

  React.useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (typeof document === 'undefined' || !open || !elevator) {
    return null;
  }

  return createPortal(
    <div className="fleet-drawer-root">
      <button
        type="button"
        className="fleet-drawer-backdrop"
        aria-label="Đóng bảng chi tiết"
        onClick={onClose}
      />
      <div
        className="fleet-drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fleet-drawer-title"
      >
        <header className="fleet-drawer-header">
          <div>
            <p className="ops-label text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Chi tiết thang</p>
            <h2 id="fleet-drawer-title" className="mt-1 text-xl font-semibold text-slate-100">
              {elevator.elevatorId}
            </h2>
          </div>
          <button type="button" className="fleet-drawer-close" onClick={onClose}>
            Đóng
          </button>
        </header>
        <div className="fleet-drawer-body">
          <ElevatorDetailPanel
            elevator={elevator}
            rootElement="div"
            className="!rounded-2xl !border-white/10 !bg-slate-950/40 !p-4 !shadow-none"
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
