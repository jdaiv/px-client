#version 300 es

precision highp float;

in vec4 particleColor;
out vec4 color;

void main() {
    color = particleColor;
}