precision highp float;

uniform float uTime;
uniform float uTexSize;
uniform sampler2D uTexture;

varying highp vec2 vTextureCoord;

vec4 EncodeFloatRGBA(float v) {
  vec4 enc = vec4(1.0, 255.0, 65025.0, 16581375.0) * v;
  enc = fract(enc);
  enc -= enc.yzww * vec4(1.0/255.0, 1.0/255.0, 1.0/255.0, 0.0);
  return enc;
}

float DecodeFloatRGBA(vec4 rgba) {
  return dot(rgba, vec4(1.0, 1.0/255.0, 1.0/65025.0, 1.0/16581375.0));
}

float getIndex(float index) {
    return DecodeFloatRGBA(
        texture2D(uTexture,
            vec2(
                mod(index, uTexSize),
                floor((index) / uTexSize)
            ) / uTexSize
        )
    );
}

void main() {
    float index = floor(vTextureCoord.x * uTexSize + (vTextureCoord.y * uTexSize) * uTexSize);
    float slot = mod(index, 24.0);
    float value = DecodeFloatRGBA(texture2D(uTexture, vTextureCoord));

    if (slot > 5.0 && slot < 9.0) {
        value = value + getIndex(index - 6.0) * uTime;
    }
    if (slot > 8.0 && slot < 12.0) {
        value = value - value * getIndex(index - 6.0) * uTime;
    }

    // vec2 coords = vec2(vTextureCoord.x, vTextureCoord.y) * uScreenSize;
    // float slot = coords.y % 8;
    // vec4 info = texture2D(uSampler, vec2(vTextureCoord.x, coords.y - slot / uScreenSize.y));
    gl_FragColor = EncodeFloatRGBA(value);
    // p.life -= dt
    // if (p.life <= 0) {
    //     p.active = false
    //     return
    // }
    // p.size = p.life / p.lifetime * p.startSize
    // p.color[3] = p.life / p.lifetime * 255
    // if (!p.pause) {
    //     vec3.scaleAndAdd(p.velocity, p.velocity, p.gravity, dt)
    //     vec3.mul(p.velocity, p.velocity, p.dampening)
    //     vec3.scaleAndAdd(p.position, p.position, p.velocity, dt)
    //     if (p.bounce >= 0 && p.position[1] < 0) {
    //         p.position[1] *= -1
    //         p.velocity[1] *= -1
    //         vec3.scale(p.velocity, p.velocity, p.bounce)
    //         if (vec3.len(p.velocity) < 1) {
    //             p.pause = true
    //         }
    //     }
    // }
}