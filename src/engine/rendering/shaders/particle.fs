#version 300 es

precision highp float;

in vec4 particleColor;
in float size;
out vec4 color;

void main() {
    ivec2 iCoords = ivec2(gl_FragCoord);
    vec2 dist = gl_PointCoord * 2.0 - 1.0;
    if (dot(dist, dist) > 1.0) {
        discard;
    }
    color = particleColor;
    // if ((color.a < 0.5 && (iCoords.x % 2 ^ iCoords.y % 2) == 1) ||
    //     (color.a < 0.25 && (iCoords.x % 2 + iCoords.y % 2) > 1)) {
    //     discard;
    // }
    // color.a = 1.0;
}