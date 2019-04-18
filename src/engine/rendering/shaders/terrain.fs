#version 300 es

precision highp float;

uniform sampler2D uSampler;

in highp vec2 vTextureCoord;
in highp vec3 vPos;
out vec4 color;

void main() {
    vec2 dist = mod(vPos.xy, 16.0) / 16.0;
    dist = ((dist * 2.0) - 1.0);
    // color = vec4(0, 1, 0, 1) * smoothstep(0.6, 0.7, (1.0 - dot(dist, dist)));
    color = vec4(0, 0.5, 0, 1) * smoothstep(0.95, 1.0, 1.0 - abs(dist.x * dist.y));
    color.g -= vPos.z / 4.0;

    color += texture(uSampler, vPos.xy / 64.0) * vec4(0, 1, 0, 0);
}