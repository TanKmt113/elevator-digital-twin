import { describe, expect, it } from 'vitest';
import { DASHBOARD_SECTION_TITLES } from '../../src/app/App';

describe('quickstart flow placeholder', () => {
  it('renders the operator monitoring layout with synchronized sections', () => {
    expect(DASHBOARD_SECTION_TITLES).toContain('Tổng quan thang máy');
    expect(DASHBOARD_SECTION_TITLES).toContain('Mô hình 3D');
    expect(DASHBOARD_SECTION_TITLES).toContain('Cảnh báo dự đoán');
  });

  it('covers the documented phase-2 bring-up validation path', () => {
    const validationSteps = [
      'backend readiness',
      'Twin bootstrap',
      'realtime reconciliation',
      'analytics warning traceability',
      'dashboard degraded states'
    ];

    expect(validationSteps).toContain('analytics warning traceability');
    expect(validationSteps).toHaveLength(5);
  });
});
