import { useEffect, useRef } from "react";

// 4 particle types drawn on canvas
const TYPES = ["saffron", "leaf", "petal", "seed"];

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

function createParticle(canvasWidth) {
  const type = TYPES[Math.floor(Math.random() * TYPES.length)];
  return {
    type,
    x: randomBetween(0, canvasWidth),
    y: randomBetween(-120, -10),
    size: randomBetween(8, 18),
    speedY: randomBetween(0.6, 1.6),
    speedX: randomBetween(-0.5, 0.5),
    rotation: randomBetween(0, Math.PI * 2),
    rotationSpeed: randomBetween(-0.02, 0.02),
    opacity: randomBetween(0.35, 0.75),
    sway: randomBetween(0.3, 0.9),
    swayOffset: randomBetween(0, Math.PI * 2),
    swaySpeed: randomBetween(0.008, 0.022),
    tick: 0,
  };
}

// Draw each particle type
function drawParticle(ctx, p) {
  ctx.save();
  ctx.globalAlpha = p.opacity;
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);

  if (p.type === "saffron") {
    // Saffron strand — thin curved line with a trumpet tip
    const s = p.size;
    ctx.strokeStyle = "#E8620A";
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.6);
    ctx.bezierCurveTo(s * 0.3, -s * 0.2, -s * 0.3, s * 0.2, 0, s * 0.6);
    ctx.stroke();
    // Trumpet tip
    ctx.fillStyle = "#F5A800";
    ctx.beginPath();
    ctx.ellipse(0, s * 0.6, s * 0.22, s * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    // Stigma dots
    ctx.fillStyle = "#D97736";
    ctx.beginPath();
    ctx.arc(0, -s * 0.6, s * 0.1, 0, Math.PI * 2);
    ctx.fill();
  } else if (p.type === "leaf") {
    // Autumn leaf — teardrop with a midrib
    const s = p.size;
    const hue = Math.random() > 0.5 ? "#C8380A" : "#D97736";
    ctx.fillStyle = hue;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.7);
    ctx.bezierCurveTo(s * 0.55, -s * 0.3, s * 0.55, s * 0.3, 0, s * 0.7);
    ctx.bezierCurveTo(-s * 0.55, s * 0.3, -s * 0.55, -s * 0.3, 0, -s * 0.7);
    ctx.fill();
    // Midrib
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.65);
    ctx.lineTo(0, s * 0.65);
    ctx.stroke();
  } else if (p.type === "petal") {
    // Flower petal — rounded oval
    const s = p.size;
    ctx.fillStyle = "#F5A800";
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.32, s * 0.62, 0, 0, Math.PI * 2);
    ctx.fill();
    // Subtle vein
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.55);
    ctx.lineTo(0, s * 0.55);
    ctx.stroke();
  } else {
    // Spice seed — small oval, warm brown
    const s = p.size * 0.55;
    ctx.fillStyle = "#8B4513";
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.38, s * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,220,150,0.3)";
    ctx.beginPath();
    ctx.ellipse(-s * 0.1, -s * 0.15, s * 0.12, s * 0.28, -0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

const PARTICLE_COUNT = 28;

export default function FallingParticles() {
  const canvasRef = useRef(null);
  const stateRef = useRef({ particles: [], raf: null, width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const state = stateRef.current;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      state.width = canvas.width;
      state.height = canvas.height;
    };
    resize();
    window.addEventListener("resize", resize);

    // Seed particles spread across the full height so they're visible immediately
    state.particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const p = createParticle(state.width);
      // Spread initial y positions so the screen isn't empty at load
      p.y = randomBetween(-50, state.height * 0.9);
      return p;
    });

    const tick = () => {
      ctx.clearRect(0, 0, state.width, state.height);

      for (const p of state.particles) {
        p.tick++;
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(p.swayOffset + p.tick * p.swaySpeed) * p.sway;
        p.rotation += p.rotationSpeed;

        // Reset when off-screen
        if (p.y > state.height + 30 || p.x < -40 || p.x > state.width + 40) {
          const fresh = createParticle(state.width);
          Object.assign(p, fresh);
        }

        drawParticle(ctx, p);
      }

      state.raf = requestAnimationFrame(tick);
    };

    state.raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(state.raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 9999,
      }}
      aria-hidden="true"
    />
  );
}
