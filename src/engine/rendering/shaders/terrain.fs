#version 300 es

precision highp float;

uniform sampler2D uSampler;
uniform sampler2D uSamplerTwo;
uniform float uTime;

in highp vec2 vTextureCoord;
in highp vec3 vPos;
out vec4 color;

float lineWidth = 0.25;

void main() {
    color += (texture(uSampler, vPos.xy / 512.0) * vec4(0, 1, 0, 0) +
              texture(uSampler, vPos.yx / 1024.0) * vec4(0, 0.5, 0, 0) +
              texture(uSampler, vPos.xy / 128.0) * vec4(0, 0.5, 0, 0));

    vec2 pos = mod(vPos.xy + 8.0, 16.0);
    color.g -= abs(vPos.z * (vPos.z > 0.0 ? 0.25 : 0.125));

    if (mod(pos.x, 2.0) > 1.5 && mod(pos.y, 2.0) > 1.5 &&
        (pos.x <= lineWidth || pos.x > 16.0 - lineWidth ||
        pos.y <= lineWidth || pos.y > 16.0 - lineWidth)) {
        color.g = (1.0 - color.g) * 0.1;
    }

}