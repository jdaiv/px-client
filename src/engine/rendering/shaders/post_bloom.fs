#version 300 es

precision highp float;

uniform highp float uTime;
uniform vec4 uColor;
uniform sampler2D uSampler;
uniform sampler2D uSamplerTwo;

out vec4 color;

float colorLevels = 4.0;

void main() {
    ivec2 iCoords = ivec2(gl_FragCoord);
    color = texelFetch(uSampler, iCoords, 0);
    float lum = max(color.r, max(color.g, color.b));
    color = floor(color * colorLevels) / colorLevels;
    if (lum < 0.2 && (iCoords.x % 2 + iCoords.y % 2) > 1) {
        discard;
    } else if (lum < 0.4 && (iCoords.x % 2 + iCoords.y % 2) > 0) {
        color.rgb *= 0.5;
    }
}