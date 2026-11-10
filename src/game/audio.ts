export function createAudio() {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let noise: AudioBuffer | null = null;
  let muted = false;

  const ac = () => {
    if (!ctx) {
      const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new C();
      master = ctx.createGain();
      master.gain.value = 0.35;
      master.connect(ctx.destination);
      const dur = 0.12;
      noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
      const data = noise.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
      }
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  };

  const tone = (freq: number, dur: number, type: OscillatorType, gain: number) => {
    if (muted) return;
    const context = ac();
    if (!master) return;
    const o = context.createOscillator();
    const g = context.createGain();
    o.type = type;
    o.frequency.value = freq * (0.94 + Math.random() * 0.12);
    g.gain.setValueAtTime(gain, context.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, context.currentTime + dur);
    o.connect(g);
    g.connect(master);
    o.start();
    o.stop(context.currentTime + dur);
  };

  const whoosh = (gain: number) => {
    if (muted || !noise) return;
    const context = ac();
    if (!master || !noise) return;
    const src = context.createBufferSource();
    src.buffer = noise;
    const filter = context.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 700;
    const g = context.createGain();
    g.gain.value = gain;
    src.connect(filter);
    filter.connect(g);
    g.connect(master);
    src.start();
  };

  return {
    unlock() {
      ac();
    },
    setMuted(next: boolean) {
      muted = next;
      if (master) master.gain.value = next ? 0 : 0.35;
    },
    play(ev: string) {
      if (ev === "stab") {
        whoosh(0.5);
        tone(220, 0.07, "sawtooth", 0.08);
      } else if (ev === "hit") {
        tone(140, 0.08, "square", 0.12);
        tone(420, 0.05, "triangle", 0.05);
      } else if (ev === "hurt") {
        tone(90, 0.16, "sawtooth", 0.14);
      } else if (ev === "dash") {
        whoosh(0.28);
      } else if (ev === "kill") {
        tone(520, 0.09, "square", 0.07);
      } else if (ev === "windup") {
        tone(660, 0.04, "square", 0.03);
      } else if (ev === "wave") {
        tone(392, 0.1, "triangle", 0.06);
        tone(523, 0.14, "triangle", 0.05);
      } else if (ev === "win") {
        tone(392, 0.12, "triangle", 0.07);
        tone(523, 0.14, "triangle", 0.07);
        tone(659, 0.2, "triangle", 0.07);
      } else if (ev === "die") {
        tone(110, 0.28, "sawtooth", 0.12);
      } else if (ev === "throw") {
        whoosh(0.42);
        tone(310, 0.08, "triangle", 0.06);
      } else if (ev === "pickup") {
        tone(740, 0.07, "square", 0.05);
        tone(980, 0.09, "triangle", 0.04);
      } else if (ev === "train") {
        tone(70, 0.22, "sawtooth", 0.05);
      }
    },
  };
}
