#version 300 es

precision mediump float;

uniform mat4 uVP_Matrix;
uniform mat4 uM_Matrix;
uniform sampler2D uSampler;
uniform float uTime;

in vec4 aVertexPosition;
in vec2 aTextureCoord;

out highp vec2 vTextureCoord;
out highp vec3 vPos;

void main() {
    gl_Position = uVP_Matrix * uM_Matrix * (
        aVertexPosition
        // + vec4((texelFetch(uSampler, ivec2(mod(aVertexPosition.xy, 256.0)), 0).rgb * 4.0 - 2.0), 0)
        // + vec4(
        //     0, sin(uTime / 400.0 + aVertexPosition.z / 4.0), 0, 0
        // )
    );
    vTextureCoord = aTextureCoord;
    vPos = aVertexPosition.xzy;
}