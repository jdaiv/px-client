precision highp float;

uniform highp float uTime;

void main() {
    gl_FragColor = vec4(sin(uTime / 200.0) * 0.40 + 0.6, 0, 0, 1);
}