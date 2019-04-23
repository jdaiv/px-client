#version 300 es

precision highp float;

uniform sampler2D uSampler;
uniform sampler2D uSamplerTwo;

in highp vec2 vTextureCoord;
in highp vec3 vPos;
out vec4 color;

void main() {
    vec2 dist = mod(vPos.xy, 16.0) / 16.0;
    dist = ((dist * 2.0) - 1.0);
    // color = vec4(0, 1, 0, 1) * smoothstep(0.6, 0.7, (1.0 - dot(dist, dist)));
    color = vec4(0, 0.5, 0, 1) * smoothstep(0.95, 1.0, 1.0 - abs(dist.x * dist.y));
    color.g -= abs(vPos.z / (vPos.z > 0.0 ? 2.0 : 8.0));

    color += (texture(uSampler, vPos.xy / 64.0) * vec4(0, 1, 0, 0) +
              texture(uSampler, vPos.yx / 256.0) * vec4(0, 1, 0, 0) +
              texture(uSampler, vPos.xy / 32.0) * vec4(0, 1, 0, 0)) / 1.5;
}