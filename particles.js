export class ParticleEffectManager {
    constructor(scene) {
        this.scene = scene;
        this.particles = this.scene.add.particles('particle');
        this.particleEmitter = null;
    }

    createEffect(x, y) {
        if (this.particleEmitter) {
            this.particleEmitter.stop();
        }

        this.particleEmitter = this.particles.createEmitter({
            x: x,
            y: y,
            speed: { min: -200, max: 200 },
            scale: { start: 0.5, end: 0 },
            lifespan: 500,
            quantity: 10,
            blendMode: 'ADD',
        });

        setTimeout(() => {
            if (this.particleEmitter) this.particleEmitter.stop();
        }, 500);
    }
}