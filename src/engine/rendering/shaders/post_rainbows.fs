#version 300 es

precision highp float;

uniform highp float uTime;
uniform vec4 uColor;
uniform sampler2D uSampler;
uniform sampler2D uSamplerTwo;

out vec4 color;

vec4 processColor(vec2 coords, vec4 color) {
    if (color.w >= 0.0 && length(color.xyz) > 0.0) {
        color.x = abs(sin(coords.y / 8.0 + uTime / 100.0));
        color.y = abs(sin(coords.y / 8.0 + uTime / 150.0));
        color.z = abs(sin(coords.y / 8.0 + uTime / 200.0));
    }
    return color;
}

void main() {
    color = texelFetch(uSamplerTwo, ivec2(gl_FragCoord), 0);

    // color = processColor(screenCoords, color);
}