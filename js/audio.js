// Suara benar/salah memakai file mp3 di folder datasets; "pop" kecil dibuat lewat WebAudio
const sfx = (() => {
  let ctx, on = true;
  const clips = {
    yeay: new Audio(encodeURI('datasets/Yayyy - Sound Effect.mp3')),
    tetot: new Audio(encodeURI('datasets/Wrong Sound Effect (Sound Effect Salah).mp3')),
  };
  const play = (k) => {
    if (!on) return;
    Object.values(clips).forEach((c) => c.pause());
    clips[k].currentTime = 0;
    clips[k].play().catch(() => {});
  };
  return {
    get on() { return on; },
    toggle() { on = !on; if (!on) Object.values(clips).forEach((c) => c.pause()); return on; },
    stop() { Object.values(clips).forEach((c) => c.pause()); },
    yeay: () => play('yeay'),
    tetot: () => play('tetot'),
    pop() {
      if (!on) return;
      try {
        ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
        const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
        o.frequency.setValueAtTime(500, t);
        o.frequency.exponentialRampToValueAtTime(900, t + 0.1);
        g.gain.setValueAtTime(0.2, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        o.connect(g).connect(ctx.destination);
        o.start(t);
        o.stop(t + 0.1);
      } catch (e) {}
    },
  };
})();
