function formatTime(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function createTimelineController({
  elapsedLabel,
  durationLabel,
  fillNode,
}) {
  function reset() {
    elapsedLabel.textContent = "00:00";
    durationLabel.textContent = "00:00";
    fillNode.style.width = "0%";
  }

  function setDuration(ms) {
    durationLabel.textContent = formatTime(ms);
  }

  function setProgress(elapsed, total) {
    elapsedLabel.textContent = formatTime(elapsed);
    const ratio = total > 0 ? Math.min(elapsed / total, 1) : 0;
    fillNode.style.width = `${Math.round(ratio * 100)}%`;
  }

  return {
    reset,
    setDuration,
    setProgress,
  };
}
