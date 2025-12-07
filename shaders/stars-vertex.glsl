attribute float size;
attribute vec3 customColor;
varying vec3 vColor;
uniform float uTime;

void main() {
    vColor = customColor;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    float dist = -mvPosition.z;
    // 星星不需要太大，这里限制一下大小
    gl_PointSize = size * (1000.0 / dist); 
    gl_PointSize = clamp(gl_PointSize, 1.0, 8.0);
    gl_Position = projectionMatrix * mvPosition;
}
