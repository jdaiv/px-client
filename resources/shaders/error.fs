precision highp float;

uniform highp float uTime;

void main() {
    gl_FragColor = vec4(sin(uTime / 100.0), 0, 0, 1);
}