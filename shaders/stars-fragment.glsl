varying vec3 vColor;
uniform float uTime;

float random(vec2 st) { return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123); }

void main() {
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    float r = dot(cxy, cxy);
    if (r > 1.0) discard;
    
    // 模拟星星闪烁
    float noise = random(gl_FragCoord.xy);
    float twinkle = 0.7 + 0.3 * sin(uTime * 2.0 + noise * 10.0);
    
    float glow = 1.0 - r;
    glow = pow(glow, 1.5);
    
    gl_FragColor = vec4(vColor * twinkle, glow * 0.8);
}
