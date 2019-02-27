precision highp float;

uniform highp float uTime;

varying highp float scale;

void main() {
    // gl_FragColor = vec4((sin(uTime / 200.0) * 0.40 + 0.6) * scale, 0, 0, 1);
    gl_FragColor = vec4((sin(uTime / 200.0 + scale) * 0.40 + 0.6), 0, 0, 1);
}