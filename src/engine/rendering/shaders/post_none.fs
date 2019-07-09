#version 300 es

precision highp float;

uniform sampler2D uSampler;
uniform sampler2D uSamplerTwo;

out vec4 color;

float LinearizeDepth(float zoverw){
    float n = 1.0; // camera z near
    float f = 1024.0; // camera z far
    return (2.0 * n) / (f + n - zoverw * (f - n));
}

vec4 getWithOffset(float x, float y) {
    return texelFetch(uSampler, ivec2(gl_FragCoord.x + x, gl_FragCoord.y + y), 0);
}

float getDepthWithOffset(float x, float y) {
    return LinearizeDepth(texelFetch(uSamplerTwo, ivec2(gl_FragCoord.x + x, gl_FragCoord.y + y), 0).r);
}

float maxDepthDiff = 0.025;
vec3 outlineColor = vec3(0, 0.25, 0);

void main() {
    color = getWithOffset(0.0, 0.0);
    // float depth = getDepthWithOffset(0.0, 0.0);

    // if (abs(depth - getDepthWithOffset(-1.0, 0.0)) > maxDepthDiff ||
    //     abs(depth - getDepthWithOffset(1.0, 0.0)) > maxDepthDiff ||
    //     abs(depth - getDepthWithOffset(0.0, -1.0)) > maxDepthDiff ||
    //     abs(depth - getDepthWithOffset(0.0, 1.0)) > maxDepthDiff) {
    //     color.rgb *= 0.5;
    // } else {
    //     // color.rgb *= 0.75;
    // }

    // color.a = depth;
}