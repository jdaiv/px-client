precision mediump float;

uniform float uTexSize;
uniform float uOffset;

attribute float aPoint;
attribute highp float aData;

varying highp float vData;

vec2 map(vec2 s, float a1, float a2, float b1, float b2) {
    return vec2(
            b1 + (s.x - a1) * (b2 - b1) / (a2 - a1),
            b1 + (s.y - a1) * (b2 - b1) / (a2 - a1)
    );
}

void main() {
    float index = mod(floor(aPoint + uOffset), uTexSize * uTexSize);
    vec2 coords = map(
        vec2(mod(index, uTexSize) + 0.5, floor(index / uTexSize) + 0.5),
        0.0, uTexSize, -1.0, 1.0
    );
    gl_Position = vec4(coords, 0.5, 1.0);
    gl_PointSize = 1.0;
    vData = aData;
}