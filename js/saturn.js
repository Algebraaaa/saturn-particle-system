/**
 * saturn.js - 土星粒子系统模块
 * 负责土星及其光环的粒子生成和渲染
 */

class Saturn {
    constructor(scene, uniforms, shaderManager) {
        this.scene = scene;
        this.uniforms = uniforms;
        this.shaderManager = shaderManager;
        this.particles = null;
    }

    init() {
        const particleCount = 1200000; // 粒子总数：120万
        const geometry = new THREE.BufferGeometry();
        
        // 申请内存
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        const opacities = new Float32Array(particleCount);
        const orbitSpeeds = new Float32Array(particleCount);
        const isRings = new Float32Array(particleCount);
        const randomIds = new Float32Array(particleCount);

        // 土星本体的色调
        const bodyColors = [
            new THREE.Color('#E3DAC5'), 
            new THREE.Color('#C9A070'), 
            new THREE.Color('#E3DAC5'), 
            new THREE.Color('#B08D55')  
        ];
        
        // 土星环的各层颜色 (参考卡西尼号数据)
        const colorRingC = new THREE.Color('#2A2520'); 
        const colorRingB_Inner = new THREE.Color('#CDBFA0'); 
        const colorRingB_Outer = new THREE.Color('#DCCBBA'); 
        const colorCassini = new THREE.Color('#050505'); // 卡西尼缝 (黑的)
        const colorRingA = new THREE.Color('#989085'); 
        const colorRingF = new THREE.Color('#AFAFA0'); 

        const R_PLANET = 18; // 行星基础半径

        for(let i = 0; i < particleCount; i++) {
            let x, y, z, r, g, b, size, opacity, speed, isRingVal;
            randomIds[i] = Math.random();

            // 前 25% 的粒子用来画土星本体
            if (i < particleCount * 0.25) {
                isRingVal = 0.0;
                speed = 0.0;
                const u = Math.random();
                const v = Math.random();
                const theta = 2 * Math.PI * u;
                const phi = Math.acos(2 * v - 1);
                const rad = R_PLANET;
                
                x = rad * Math.sin(phi) * Math.cos(theta);
                let rawY = rad * Math.cos(phi);
                z = rad * Math.sin(phi) * Math.sin(theta);
                
                // 土星是扁的，压扁一点 Y 轴
                y = rawY * 0.9;
                
                // 生成条纹图案
                let lat = (rawY / rad + 1.0) * 0.5; 
                let bandNoise = Math.cos(lat * 40.0) * 0.8 + Math.cos(lat * 15.0) * 0.4;
                let colIndex = Math.floor(lat * 4 + bandNoise) % 4;
                if (colIndex < 0) colIndex = 0;
                let baseCol = bodyColors[colIndex];
                
                r = baseCol.r; g = baseCol.g; b = baseCol.b;
                size = 1.0 + Math.random() * 0.8; 
                opacity = 0.8; 
            } else {
                // 剩下的粒子画光环
                isRingVal = 1.0;
                let zoneRand = Math.random();
                let ringRadius;
                let ringCol;
                
                // 根据概率分布生成不同的环带
                if (zoneRand < 0.15) { 
                    // C环: 较暗，较内层
                    ringRadius = R_PLANET * (1.235 + Math.random() * (1.525 - 1.235));
                    ringCol = colorRingC;
                    size = 0.5; opacity = 0.3; 
                } else if (zoneRand < 0.65) { 
                    // B环: 最亮，最宽
                    let t = Math.random();
                    ringRadius = R_PLANET * (1.525 + t * (1.95 - 1.525));
                    ringCol = colorRingB_Inner.clone().lerp(colorRingB_Outer, t);
                    size = 0.8 + Math.random() * 0.6; opacity = 0.85; 
                    // B环有些地方密度特高
                    if (Math.sin(ringRadius * 2.0) > 0.8) opacity *= 1.2;
                } else if (zoneRand < 0.69) { 
                    // 卡西尼缝: 几乎是空的
                    ringRadius = R_PLANET * (1.95 + Math.random() * (2.025 - 1.95));
                    ringCol = colorCassini;
                    size = 0.3; opacity = 0.1; 
                } else if (zoneRand < 0.99) { 
                    // A环
                    ringRadius = R_PLANET * (2.025 + Math.random() * (2.27 - 2.025));
                    ringCol = colorRingA;
                    size = 0.7; opacity = 0.6;
                    // 恩克环缝
                    if (ringRadius > R_PLANET * 2.2 && ringRadius < R_PLANET * 2.21) opacity = 0.1;
                } else { 
                    // F环: 最外层，很细
                    ringRadius = R_PLANET * (2.32 + Math.random() * 0.02);
                    ringCol = colorRingF;
                    size = 1.0; opacity = 0.7;
                }
                
                const theta = Math.random() * Math.PI * 2;
                x = ringRadius * Math.cos(theta);
                z = ringRadius * Math.sin(theta);
                
                // 环也是有厚度的
                let thickness = 0.15;
                if (ringRadius > R_PLANET * 2.3) thickness = 0.4; 
                y = (Math.random() - 0.5) * thickness;
                
                r = ringCol.r; g = ringCol.g; b = ringCol.b;
                
                // 开普勒第三定律
                speed = 8.0 / Math.sqrt(ringRadius);
            }
            
            positions[i*3] = x; positions[i*3+1] = y; positions[i*3+2] = z;
            colors[i*3] = r; colors[i*3+1] = g; colors[i*3+2] = b;
            sizes[i] = size; opacities[i] = opacity;
            orbitSpeeds[i] = speed; isRings[i] = isRingVal;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('opacityAttr', new THREE.BufferAttribute(opacities, 1));
        geometry.setAttribute('orbitSpeed', new THREE.BufferAttribute(orbitSpeeds, 1));
        geometry.setAttribute('isRing', new THREE.BufferAttribute(isRings, 1));
        geometry.setAttribute('aRandomId', new THREE.BufferAttribute(randomIds, 1));

        const material = new THREE.ShaderMaterial({
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true,
            uniforms: this.uniforms,
            vertexShader: this.shaderManager.getVertexShader('saturn'),
            fragmentShader: this.shaderManager.getFragmentShader('saturn'),
            transparent: true
        });

        this.particles = new THREE.Points(geometry, material);
        this.particles.rotation.z = 26.73 * (Math.PI / 180); // 土星真实的轴倾角
        this.scene.add(this.particles);
    }

    update() {
        // 粒子系统的更新逻辑（如需要）
    }
}
