precision mediump float;

uniform mat4 uVP_Matrix;
uniform sampler2D uTexture;
uniform float uTexSize;

attribute float aPoint;

varying vec4 particleColor;

vec4 EncodeFloatRGBA(float v) {
    float _v = v + 32000.0;
    _v = max(0.0, min(_v, 64000.0));
    float _f = floor(fract(_v) * 64000.0);
    return vec4(
        floor(_v / 255.0) / 255.0,
        floor(mod(_v, 255.0)) / 255.0,
        floor(_f / 255.0) / 255.0,
        floor(mod(_f, 255.0)) / 255.0
    );
}

float DecodeFloatRGBA(vec4 v) {
    return ((v.x * 255.0 * 255.0 + v.y * 255.0) - 32000.0 +
        ((v.z * 255.0 * 255.0 + v.w * 255.0) / 64000.0));
}

float getOffset(float offset) {
    return DecodeFloatRGBA(
        texture2D(uTexture,
            vec2(
                mod(aPoint + offset, uTexSize) + 0.5,
                floor((aPoint + offset) / uTexSize) + 0.5
            ) * (1.0 / uTexSize)
        )
    );
}

void main() {
    float alive = getOffset(19.0) >= 0.0 ? 1.0 : 0.0;
    vec4 pos = uVP_Matrix * vec4(
        getOffset(6.0),
        getOffset(7.0),
        getOffset(8.0),
        1
    );
    gl_Position = pos;
    gl_PointSize = getOffset(13.0) * abs(500.0 / pos.z) * alive;
    particleColor = vec4(
        getOffset(14.0),
        getOffset(15.0),
        getOffset(16.0),
        getOffset(17.0) * alive
    );
}