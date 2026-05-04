import { describe, expect, it } from 'vitest';
import { DASHBOARD_SECTION_TITLES } from '../../src/app/App';

describe('quickstart flow placeholder', () => {
  it('renders the operator monitoring layout with synchronized sections', () => {
    expect(DASHBOARD_SECTION_TITLES).toContain('Fleet Overview');
    expect(DASHBOARD_SECTION_TITLES).toContain('Twin Scene');
    expect(DASHBOARD_SECTION_TITLES).toContain('Predictive Warnings');
  });
});
