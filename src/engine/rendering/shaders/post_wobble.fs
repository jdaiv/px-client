#version 300 es

precision highp float;

uniform highp float uTime;
uniform vec4 uColor;
uniform sampler2D uSampler;

out vec4 color;

void main() {
    color = texelFetch(uSampler, ivec2(
        gl_FragCoord.x + sin(gl_FragCoord.y / 16.0 + uTime / 400.0) * 0.01,
        gl_FragCoord.y + sin(gl_FragCoord.x / 16.0 + uTime / 400.0) * 0.01
    ), 0);

    // color = processColor(screenCoords, color);
}