#version 300 es

precision mediump float;

uniform float uTexSize;
uniform float uOffset;

in ivec2 aPoint;
in highp vec4 aData;

out highp vec4 vData;

vec2 map(vec2 s, float a1, float a2, float b1, float b2) {
    return vec2(
            b1 + (s.x - a1) * (b2 - b1) / (a2 - a1),
            b1 + (s.y - a1) * (b2 - b1) / (a2 - a1)
    );
}

void main() {
    vec2 coords = map(
        vec2(aPoint) + vec2(0.5),
        0.0, uTexSize, -1.0, 1.0
    );
    gl_Position = vec4(coords, 0.0, 1.0);
    gl_PointSize = 1.0;
    vData = aData;
}