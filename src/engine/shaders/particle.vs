precision mediump float;

uniform mat4 uVP_Matrix;
uniform sampler2D uTexture;
uniform float uTexSize;

attribute float aPoint;

varying vec4 particleColor;

float DecodeFloatRGBA(vec4 rgba) {
  return dot(rgba, vec4(1.0, 1.0/255.0, 1.0/65025.0, 1.0/16581375.0));
}

float getOffset(float offset) {
    return DecodeFloatRGBA(
        texture2D(uTexture,
            vec2(
                mod(aPoint + offset, uTexSize),
                floor((aPoint + offset) / uTexSize)
            ) / uTexSize
        )
    );
}

void main() {
    vec4 pos = uVP_Matrix * vec4(
        getOffset(6.0),
        getOffset(7.0),
        getOffset(8.0),
        1
    );
    gl_Position = pos;
    gl_PointSize = getOffset(13.0) * abs(500.0 / pos.z);
    particleColor = vec4(
        getOffset(14.0),
        getOffset(15.0),
        getOffset(16.0),
        getOffset(17.0)
    );
}