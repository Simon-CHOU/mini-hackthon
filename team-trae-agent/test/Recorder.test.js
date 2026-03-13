import { describe, it, expect, vi } from 'vitest';
import { Recorder } from '../src/Recorder';

describe('Recorder', () => {
  it('should not record when stopped', () => {
    const recorder = new Recorder();
    recorder.record('a');
    expect(recorder.getEvents()).toHaveLength(0);
  });

  it('should record events when started', () => {
    const recorder = new Recorder();
    recorder.start();
    recorder.record('a');
    recorder.record('b');
    const events = recorder.getEvents();
    expect(events).toHaveLength(2);
    expect(events[0].data).toBe('a');
    expect(events[1].data).toBe('b');
    expect(typeof events[0].timestamp).toBe('number');
  });

  it('should stop recording', () => {
    const recorder = new Recorder();
    recorder.start();
    recorder.record('a');
    recorder.stop();
    recorder.record('b');
    expect(recorder.getEvents()).toHaveLength(1);
  });

  it('should clear events', () => {
    const recorder = new Recorder();
    recorder.start();
    recorder.record('a');
    recorder.clear();
    expect(recorder.getEvents()).toHaveLength(0);
  });
});
