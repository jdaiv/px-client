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

float getSlot(float base, float index) {
    return DecodeFloatRGBA(
        texture2D(uTexture,
            vec2(
                floor(base + index) + 0.5,
                floor(vTextureCoord.y) + 0.5
            ) / uTexSize
        )
    );
}

void main() {
    float index = floor(vTextureCoord.x + floor(vTextureCoord.y) * uTexSize);
    float slot = mod(index, 32.0);
    float base = floor(vTextureCoord.x - slot);
    float value = getSlot(base, slot);
    float bounce = getSlot(base, 20.0);
    float lifetime = getSlot(base, 18.0);
    float life = getSlot(base, 19.0);
    float yPos = getSlot(base, 7.0);

    if (lifetime <= 0.0) {
        value = 0.0;
    } else {
        if (slot > 8.0 && slot < 12.0) {
            value = (value + (getSlot(base, slot - 9.0) * uTime) - value * ((1.0 - getSlot(base, slot - 6.0)) * uTime * 10.0));
            if (bounce >= 0.0 && yPos <= 0.1) {
                value *= slot == 10.0 ? -bounce : bounce;
            }
        } else if (slot > 5.0 && slot < 9.0) {
            value = value + getSlot(base, slot + 3.0) * uTime;
            if (bounce >= 0.0 && slot == 7.0 && value < 0.0) {
                value = 0.0;
            }
        } else if (slot == 13.0) {
            value = (
                smoothstep(0.0, life, lifetime) *
                1.0 - smoothstep(life - getSlot(base, 21.0), life, lifetime)
             ) * getSlot(base, 12.0);
        } else if (slot == 17.0) {
            value = mix(0.0, 1.0, lifetime / life) *
                1.0 - smoothstep(life - life * getSlot(base, 21.0), life, lifetime);
        } else if (slot == 18.0) {
            value -= uTime;
        }
    }

    gl_FragColor = EncodeFloatRGBA(value);
}