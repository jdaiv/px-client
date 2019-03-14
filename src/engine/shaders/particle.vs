precision mediump float;

uniform mat4 uVP_Matrix;
uniform mat4 uM_Matrix;

attribute vec4 aVertexPosition;
attribute vec4 aParticlePosition;
attribute float aParticleRotation;
attribute vec4 aParticleScale;
attribute vec4 aParticleColor;

varying vec4 particleColor;

void main() {
    gl_Position = uVP_Matrix * uM_Matrix * ((aVertexPosition * aParticleScale) + aParticlePosition);
    particleColor = aParticleColor;
}