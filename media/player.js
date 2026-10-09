'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const status = $('status');
  const toggle = $('toggle');
  const seek = $('seek');
  const time = $('time');
  const volume = $('volume');
  const format = seconds => Number.isFinite(seconds) ? `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}` : '0:00';
  try {
    if (!window.OGVPlayer) throw new Error('ogv.js was not bundled correctly.');
    // VS Code webviews cannot import the scripts used by ogv.js workers.
    const player = new OGVPlayer({ base: document.body.dataset.base, worker: false });
    $('stage').appendChild(player);
    player.preload = 'metadata';
    player.src = document.body.dataset.video;
    player.addEventListener('loadedmetadata', () => { status.textContent = ''; update(); });
    player.addEventListener('error', () => {
      status.textContent = `Cannot decode this WebM: ${player.error?.message || 'unsupported codec or inaccessible file'}`;
    });
    player.addEventListener('ended', () => { toggle.textContent = 'Play'; update(); });
    player.addEventListener('play', () => { toggle.textContent = 'Pause'; status.textContent = ''; });
    player.addEventListener('pause', () => { toggle.textContent = 'Play'; });
    function update() {
      const duration = player.duration;
      if (!seek.matches(':active')) seek.value = Number.isFinite(duration) && duration > 0 ? String(Math.round(player.currentTime / duration * 1000)) : '0';
      seek.disabled = !Number.isFinite(duration) || duration <= 0;
      time.textContent = `${format(player.currentTime)} / ${format(duration)}`;
    }
    player.addEventListener('timeupdate', update);
    toggle.addEventListener('click', () => { if (player.paused) player.play(); else player.pause(); });
    seek.addEventListener('change', () => {
      if (Number.isFinite(player.duration)) player.currentTime = Number(seek.value) / 1000 * player.duration;
    });
    volume.addEventListener('input', () => { player.volume = Number(volume.value); });
    window.addEventListener('keydown', event => {
      if (event.code === 'Space' && event.target !== toggle && event.target !== seek && event.target !== volume) {
        event.preventDefault(); toggle.click();
      }
    });
    window.addEventListener('beforeunload', () => player.stop());
    update();
  } catch (error) {
    status.textContent = `WebM preview failed: ${error.message}`;
  }
})();
