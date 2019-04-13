#version 300 es

precision mediump float;

uniform mat4 uVP_Matrix;
uniform sampler2D uTexture;
uniform float uTexSize;

in float aPoint;

out vec4 particleColor;

vec4 getOffset(float index) {
    return texelFetch(uTexture, ivec2(
        mod(aPoint + index, uTexSize),
        (aPoint + index) / uTexSize
    ), 0);
}

void main() {
    vec4 pos = uVP_Matrix * getOffset(3.0);
    gl_Position = pos;
    gl_PointSize = getOffset(0.0).w * abs(200.0 / pos.z);
    particleColor = getOffset(5.0);
}