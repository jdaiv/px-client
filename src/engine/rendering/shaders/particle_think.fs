#version 300 es

precision highp float;

uniform float uTime;
uniform float uTexSize;
uniform sampler2D uTexture;

flat in ivec2 vTextureCoord;

out vec4 color;

vec4 getSlot(int slot, int index) {
    return texelFetch(uTexture, vTextureCoord + ivec2(index - slot, 0), 0);
}

void main() {
    int slot = vTextureCoord.x % 8;
    vec4 value = getSlot(slot, slot);
    vec4 lifeAndSize = getSlot(slot, 0);
    float currentLife = lifeAndSize.x;
    float lifeTime = lifeAndSize.y;
    float startSize = lifeAndSize.z;
    vec4 position = getSlot(slot, 3);
    vec4 velocity = getSlot(slot, 4);
    vec4 params = getSlot(slot, 6);
    float bounce = params.x;
    float fadeTime = params.y;

    if (currentLife <= 0.0) {
        value = vec4(0, 0, 0, 0);
    } else {
        switch (slot) {
            case 0: // time + size
                value.x -= uTime;
                value.w = (currentLife / lifeTime) * startSize;
                break;
            case 3: // position
                value += velocity * uTime;
                if (value.y < 0.0 && bounce >= 0.0) {
                    value.y = 0.0;
                }
                break;
            case 4: // velocity
                vec4 gravity = getSlot(slot, 1);
                vec4 dampening = getSlot(slot, 2);
                value += gravity * uTime;
                value -= velocity * ((1.0 - dampening) * uTime * 10.0);
                if (bounce >= 0.0 && position.y <= 0.0) {
                    value *= vec4(bounce, -bounce, bounce, 1);
                }
                break;
            case 5: // color
                value.a = mix(0.0, 1.0, currentLife / lifeTime) *
                    1.0 - smoothstep(lifeTime - lifeTime * fadeTime, lifeTime, currentLife);
                break;
        }
        // if (slot > 8.0 && slot < 12.0) {
        //     value = (value + (getSlot(base, slot - 9.0) * uTime) - value * ((1.0 - getSlot(base, slot - 6.0)) * uTime * 10.0));

        // } else if (slot > 5.0 && slot < 9.0) {
        //     value = value + getSlot(base, slot + 3.0) * uTime;
        //     if (bounce >= 0.0 && slot == 7.0 && value < 0.0) {
        //         value = 0.0;
        //     }
        // } else if (slot == 13.0) {
        //     value = (
        //         smoothstep(0.0, life, lifetime) *
        //         1.0 - smoothstep(life - getSlot(base, 21.0), life, lifetime)
        //      ) * getSlot(base, 12.0);
        // } else if (slot == 17.0) {
        //     value = mix(0.0, 1.0, lifetime / life) *
        //         1.0 - smoothstep(life - life * getSlot(base, 21.0), life, lifetime);
        // } else if (slot == 18.0) {
        //     value -= uTime;
        // }
    }

    color = value;
}