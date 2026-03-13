import { describe, it, expect, vi } from 'vitest';
import { Player } from '../src/Player';

describe('Player', () => {
  it('should replay events with correct timing', async () => {
    const events = [
      { timestamp: 0, data: 'a' },
      { timestamp: 50, data: 'b' },
      { timestamp: 100, data: 'c' }
    ];
    const player = new Player(events);
    const callback = vi.fn();

    // Mock timers
    vi.useFakeTimers();

    const playPromise = player.play(callback);

    // Initial state
    expect(callback).not.toHaveBeenCalled();

    // Advance 10ms
    vi.advanceTimersByTime(10);
    expect(callback).toHaveBeenCalledWith('a');
    expect(callback).toHaveBeenCalledTimes(1);

    // Advance to 60ms
    vi.advanceTimersByTime(50);
    expect(callback).toHaveBeenCalledWith('b');
    expect(callback).toHaveBeenCalledTimes(2);

    // Advance to 110ms
    vi.advanceTimersByTime(50);
    expect(callback).toHaveBeenCalledWith('c');
    expect(callback).toHaveBeenCalledTimes(3);
    
    // Ensure promise resolves
    await vi.runAllTimersAsync();
    await expect(playPromise).resolves.toBeUndefined();

    vi.useRealTimers();
  });
});
