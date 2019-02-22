precision mediump float;

uniform highp float uTime;
uniform mat4 uVP_Matrix;
uniform mat4 uM_Matrix;
// no. frames, current frame
uniform vec2 uSpriteData;

attribute vec4 aVertexPosition;
attribute highp vec4 aVertexNormal;
attribute vec2 aTextureCoord;

varying highp vec4 vVertexNormal;
varying highp vec2 vTextureCoord;

void main() {
    gl_Position = uVP_Matrix * uM_Matrix * aVertexPosition;

    float frames = max(1.0, uSpriteData.x);
    if (frames > 1.0) {
        float frameOffset = 1.0 / frames;
        float currentFrame = uSpriteData.y;
        vTextureCoord = vec2(
            aTextureCoord.x * frameOffset + frameOffset * currentFrame,
            aTextureCoord.y
        );
    } else {
        vTextureCoord = aTextureCoord;
    }

    vVertexNormal = aVertexNormal;
}