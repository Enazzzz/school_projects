import React, { useCallback } from 'react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';

export default function ParticleBackground() {
  const particlesInit = useCallback(async engine => {
    await loadFull(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: { enable: false },
        background: { color: { value: '#00000000' } },
        fpsLimit: 60,
        particles: {
          color: { value: '#FF0000' },
          links: { enable: false },
          move: { enable: true, speed: 0.3 },
          number: { value: 40, density: { enable: true, area: 800 } },
          opacity: { value: 0.2 },
          size: { value: { min: 1, max: 3 } },
        },
        detectRetina: true,
      }}
      className="absolute inset-0 -z-10"
    />
  );
}
