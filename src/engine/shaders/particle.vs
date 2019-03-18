precision mediump float;

uniform mat4 uVP_Matrix;

attribute vec4 aParticlePosition;
attribute float aParticleSize;
attribute vec4 aParticleColor;

varying vec4 particleColor;

void main() {
    vec4 pos = uVP_Matrix * aParticlePosition;
    gl_Position = pos;
    gl_PointSize = aParticleSize * abs(500.0 / pos.z);
    particleColor = aParticleColor;
}