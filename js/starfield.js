/**
 * starfield.js - 背景星空系统模块
 * 负责星空和星云的生成和渲染
 */

class Starfield {
    constructor(scene, shaderManager) {
        this.scene = scene;
        this.shaderManager = shaderManager;
        this.stars = null;
        this.nebula = null;
        this.starUniforms = null;
    }

    init() {
        this.initStars();
        this.initNebula();
    }

    initStars() {
        const starCount = 50000;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(starCount * 3);
        const cols = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);
        
        // 星星颜色类型
        const starColors = [
            new THREE.Color('#9bb0ff'), new THREE.Color('#ffffff'), 
            new THREE.Color('#ffcc6f'), new THREE.Color('#ff7b7b')
        ];

        for(let i=0; i<starCount; i++) {
            const r = 400 + Math.random() * 3000;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            pos[i*3] = r * Math.sin(phi) * Math.cos(theta);
            pos[i*3+1] = r * Math.cos(phi);
            pos[i*3+2] = r * Math.sin(phi) * Math.sin(theta);
            
            const colorType = Math.random();
            let c;
            if(colorType > 0.9) c = starColors[0]; 
            else if(colorType > 0.6) c = starColors[1];
            else if(colorType > 0.3) c = starColors[2]; 
            else c = starColors[3];
            
            cols[i*3] = c.r; cols[i*3+1] = c.g; cols[i*3+2] = c.b;
            sizes[i] = 1.0 + Math.random() * 3.0;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.setAttribute('customColor', new THREE.BufferAttribute(cols, 3));
        geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        this.starUniforms = { uTime: { value: 0 } };
        const mat = new THREE.ShaderMaterial({
            uniforms: this.starUniforms,
            vertexShader: this.shaderManager.getVertexShader('stars'),
            fragmentShader: this.shaderManager.getFragmentShader('stars'),
            transparent: true, 
            depthWrite: false, 
            blending: THREE.AdditiveBlending
        });

        this.stars = new THREE.Points(geo, mat);
        this.scene.add(this.stars);
    }

    initNebula() {
        const nebulaCount = 100;
        const nebGeo = new THREE.BufferGeometry();
        const nebPos = new Float32Array(nebulaCount * 3);
        const nebCols = new Float32Array(nebulaCount * 3);
        const nebSizes = new Float32Array(nebulaCount);

        for(let i=0; i<nebulaCount; i++) {
            const r = 800 + Math.random() * 2000;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.PI / 2 + (Math.random() - 0.5) * 1.5;
            
            nebPos[i*3] = r * Math.sin(phi) * Math.cos(theta);
            nebPos[i*3+1] = r * Math.cos(phi);
            nebPos[i*3+2] = r * Math.sin(phi) * Math.sin(theta);
            
            const nc = new THREE.Color().setHSL(0.6 + Math.random()*0.2, 0.8, 0.05);
            nebCols[i*3] = nc.r; nebCols[i*3+1] = nc.g; nebCols[i*3+2] = nc.b;
            nebSizes[i] = 400.0 + Math.random() * 600.0;
        }

        nebGeo.setAttribute('position', new THREE.BufferAttribute(nebPos, 3));
        nebGeo.setAttribute('customColor', new THREE.BufferAttribute(nebCols, 3));
        nebGeo.setAttribute('size', new THREE.BufferAttribute(nebSizes, 1));

        const nebShaderMat = new THREE.ShaderMaterial({
            uniforms: {},
            vertexShader: this.shaderManager.getVertexShader('stars'),
            fragmentShader: `
                varying vec3 vColor;
                void main() {
                    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
                    float r = dot(cxy, cxy);
                    if(r > 1.0) discard;
                    float glow = pow(1.0 - r, 2.0);
                    gl_FragColor = vec4(vColor, glow * 0.1); 
                }
            `,
            transparent: true, 
            depthWrite: false, 
            blending: THREE.AdditiveBlending
        });

        this.nebula = new THREE.Points(nebGeo, nebShaderMat);
        this.scene.add(this.nebula);
    }

    update(elapsedTime) {
        if (this.starUniforms) this.starUniforms.uTime.value = elapsedTime;
        
        if(this.stars) this.stars.rotation.y = elapsedTime * 0.005;
        if(this.nebula) this.nebula.rotation.y = elapsedTime * 0.003;
    }
}
