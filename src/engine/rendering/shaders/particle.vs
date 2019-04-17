#version 300 es

precision mediump float;

uniform mat4 uVP_Matrix;
uniform sampler2D uTexture;
uniform float uTexSize;

in ivec2 aPoint;

out vec4 particleColor;
out float size;

vec4 getOffset(float index) {
    return texelFetch(uTexture, aPoint + ivec2(index, 0), 0);
}

void main() {
    vec4 pos = uVP_Matrix * getOffset(3.0);
    // vec4 pos = uVP_Matrix * vec4(
    //     vec2(aPoint) / vec2(16, 2) + vec2(0, 0),
    //     0,
    //     1
    // );
    gl_Position = pos;
    size = getOffset(0.0).w * abs(200.0 / pos.z);
    gl_PointSize = size;
    particleColor = getOffset(5.0);
    particleColor.a *= particleColor.a;
    // particleColor.rgb *= particleColor.a;
}