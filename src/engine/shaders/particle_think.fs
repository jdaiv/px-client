precision highp float;

uniform float uTime;
uniform float uTexSize;
uniform sampler2D uTexture;

varying highp vec2 vTextureCoord;

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

float getIndex(float index) {
    return DecodeFloatRGBA(
        texture2D(uTexture,
            vec2(
                mod(index, uTexSize) + 0.5,
                floor((index) / uTexSize) + 0.5
            ) / uTexSize
        )
    );
}

void main() {
    float index = floor(vTextureCoord.x * uTexSize + (vTextureCoord.y * uTexSize) * uTexSize);
    float slot = mod(index, 32.0);
    float value = DecodeFloatRGBA(texture2D(uTexture, vTextureCoord));
    float bounce = getIndex(index - slot + 20.0);

    if (slot > 8.0 && slot < 12.0) {
        value = value - value * getIndex(index - 6.0) * uTime / 4.0 + getIndex(index - 9.0) * uTime;
        if (bounce >= 0.0 && getIndex(index - slot + 7.0) <= 0.0) {
            value *= slot == 10.0 ? -bounce : bounce;
        }
    } else if (slot > 5.0 && slot < 9.0) {
        value = value + getIndex(index + 3.0) * uTime;
        if (bounce >= 0.0 && slot == 7.0 && value < 0.0) {
            value = 0.0;
        }
    } else if (slot == 13.0) {
        value = getIndex(index - 1.0) * (getIndex(index + 5.0) / getIndex(index + 6.0));
    } else if (slot == 17.0) {
        value = (getIndex(index + 1.0) / getIndex(index + 2.0));
    } else if (slot == 18.0) {
        value = max(0.0, value - uTime);
    }

    gl_FragColor = EncodeFloatRGBA(value);
}