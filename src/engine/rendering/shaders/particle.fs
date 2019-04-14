#version 300 es

precision highp float;

uniform sampler2D uParticleTexture;
in vec4 particleColor;
out vec4 color;

void main() {
    color = texture(uParticleTexture, gl_PointCoord) * particleColor;
}