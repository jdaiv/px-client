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
                value.w = (mix(0.0, 1.0, currentLife / lifeTime) *
                    1.0 - smoothstep(lifeTime - lifeTime * fadeTime, lifeTime, currentLife)) * startSize;
                break;
            case 3: // position
                value += velocity * uTime;
                if (value.y < 0.01 && bounce >= 0.0) {
                    value.y = 0.01;
                }
                break;
            case 4: // velocity
                vec4 gravity = getSlot(slot, 1);
                vec4 dampening = getSlot(slot, 2);
                value += gravity * uTime;
                value -= velocity * ((1.0 - dampening) * uTime * 10.0);
                if (bounce >= 0.0 && position.y <= 0.01) {
                    value *= vec4(bounce, -bounce, bounce, 1);
                }
                break;
            case 5: // color
                value.a = (currentLife / lifeTime);
                break;
        }
    }

    color = value;
}