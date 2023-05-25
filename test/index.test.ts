import { describe, expect, it } from 'vitest';
import ms from '../src';

// 四舍五入
describe('msFn', () => {
  it('test number => string', () => {
    expect(ms(1500)).toBe('2s');
    expect(ms(10000)).toBe('10s');
    expect(ms(-3000)).toBe('-3s');
    expect(ms(8 * 1000)).toBe('8s');
    expect(ms(10 * 60 * 1000)).toBe('10m');
    expect(ms(2 * 60 * 60 * 1000)).toBe('2h');
    expect(ms(3 * 24 * 60 * 60 * 1000)).toBe('3d');
  });

  it('test string => number', () => {
    expect(ms('3d')).toBe(3 * 24 * 60 * 60 * 1000);
    expect(ms('2h')).toBe(2 * 60 * 60 * 1000);
    expect(ms('10m')).toBe(10 * 60 * 1000);
    expect(ms('8s')).toBe(8 * 1000);
    expect(ms('3ms')).toBe(3);

    expect(ms('-2h')).toBe(-2 * 60 * 60 * 1000);
  });
});
