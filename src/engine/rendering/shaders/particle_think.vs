#version 300 es

precision highp float;

uniform float uTexSize;

in ivec2 aPoint;

flat out ivec2 vTextureCoord;

vec2 map(vec2 s, float a1, float a2, float b1, float b2) {
    return vec2(
            b1 + (s.x - a1) * (b2 - b1) / (a2 - a1),
            b1 + (s.y - a1) * (b2 - b1) / (a2 - a1)
    );
}

void main() {
    float onePx = 1.0 / uTexSize;
    vec2 coords = map(
        vec2(aPoint) + vec2(0.5),
        0.0, uTexSize, -1.0, 1.0
    );
    gl_Position = vec4(coords, 0.0, 1.0);
    gl_PointSize = 1.0;
    vTextureCoord = aPoint;
}