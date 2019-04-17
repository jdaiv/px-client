#version 300 es

precision highp float;

uniform highp float uTime;
uniform vec4 uColor;
uniform sampler2D uSampler;
uniform sampler2D uSamplerTwo;

out vec4 color;

void main() {
    color = texelFetch(uSampler, ivec2(gl_FragCoord), 0);
    // if (length(color.rgb) <= 0.0 || color.a <= 0.0) {
        vec4 horizEdge = vec4(0.0);
        horizEdge -= texelFetch(uSampler, ivec2(gl_FragCoord.x - 1.0, gl_FragCoord.y - 1.0), 0) * 1.0;
        horizEdge -= texelFetch(uSampler, ivec2(gl_FragCoord.x - 1.0, gl_FragCoord.y      ), 0) * 2.0;
        horizEdge -= texelFetch(uSampler, ivec2(gl_FragCoord.x - 1.0, gl_FragCoord.y + 1.0), 0) * 1.0;
        horizEdge += texelFetch(uSampler, ivec2(gl_FragCoord.x + 1.0, gl_FragCoord.y - 1.0), 0) * 1.0;
        horizEdge += texelFetch(uSampler, ivec2(gl_FragCoord.x + 1.0, gl_FragCoord.y      ), 0) * 2.0;
        horizEdge += texelFetch(uSampler, ivec2(gl_FragCoord.x + 1.0, gl_FragCoord.y + 1.0), 0) * 1.0;
        vec4 vertEdge = vec4(0.0);
        vertEdge -= texelFetch(uSampler, ivec2(gl_FragCoord.x - 1.0, gl_FragCoord.y - 1.0), 0) * 1.0;
        vertEdge -= texelFetch(uSampler, ivec2(gl_FragCoord.x      , gl_FragCoord.y - 1.0), 0) * 2.0;
        vertEdge -= texelFetch(uSampler, ivec2(gl_FragCoord.x + 1.0, gl_FragCoord.y - 1.0), 0) * 1.0;
        vertEdge += texelFetch(uSampler, ivec2(gl_FragCoord.x - 1.0, gl_FragCoord.y + 1.0), 0) * 1.0;
        vertEdge += texelFetch(uSampler, ivec2(gl_FragCoord.x      , gl_FragCoord.y + 1.0), 0) * 2.0;
        vertEdge += texelFetch(uSampler, ivec2(gl_FragCoord.x + 1.0, gl_FragCoord.y + 1.0), 0) * 1.0;
        vec3 edge = sqrt((horizEdge.rgb * horizEdge.rgb) + (vertEdge.rgb * vertEdge.rgb));
        if (length(edge) > 1.0) {
            color.rgb = edge;
        }
    // }
}