/**
 * planets.js - 背景行星系统模块
 * 负责地球、火星、水星等背景行星的生成和渲染
 */

class Planets {
    constructor(scene, shaderManager) {
        this.scene = scene;
        this.shaderManager = shaderManager;
        this.group = null;
    }

    init() {
        this.group = new THREE.Group();
        this.scene.add(this.group);

        // 1. 火星 (Mars)
        this.createPlanet(
            new THREE.Color('#b33a00'), 
            new THREE.Color('#d16830'), 
            8.0, 
            { x: -300, y: 120, z: -450 }, 
            10, 
            0.3 
        );

        // 2. 地球 (Earth)
        this.createPlanet(
            new THREE.Color('#001e4d'), 
            new THREE.Color('#ffffff'), 
            5.0, 
            { x: 380, y: -100, z: -600 }, 
            14, 
            0.6 
        );

        // 3. 水星 (Mercury)
        this.createPlanet(
            new THREE.Color('#666666'), 
            new THREE.Color('#aaaaaa'), 
            15.0, 
            { x: -180, y: -220, z: -350 }, 
            6, 
            0.1 
        );
    }

    createPlanet(color1, color2, noiseScale, position, radius, atmosphere) {
        const geo = new THREE.SphereGeometry(radius, 48, 48);
        const mat = new THREE.ShaderMaterial({
            uniforms: {
                color1: { value: color1 },
                color2: { value: color2 },
                noiseScale: { value: noiseScale },
                lightDir: { value: new THREE.Vector3(1, 0.5, 1) },
                atmosphere: { value: atmosphere }
            },
            vertexShader: this.shaderManager.getVertexShader('planet'),
            fragmentShader: this.shaderManager.getFragmentShader('planet')
        });

        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(position.x, position.y, position.z);
        this.group.add(mesh);
    }

    update(elapsedTime) {
        if (this.group) {
            this.group.children.forEach((planet, idx) => {
                planet.rotation.y = elapsedTime * (0.05 + idx * 0.02);
            });
            this.group.rotation.y = Math.sin(elapsedTime * 0.05) * 0.02;
        }
    }

    getGroup() {
        return this.group;
    }
}
