#version 300 es

precision highp float;

in vec4 color;
in vec3 normal;
out vec4 frag_color;

void main() {
    frag_color = color;
}