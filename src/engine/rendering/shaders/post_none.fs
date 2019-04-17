#version 300 es

precision highp float;

uniform sampler2D uSampler;
uniform sampler2D uSamplerTwo;

out vec4 color;

void main() {
    color = texelFetch(uSamplerTwo, ivec2(gl_FragCoord), 0);
}