#extension GL_OES_standard_derivatives : enable

precision highp float;

uniform highp float uTime;
uniform vec4 uColor;
uniform sampler2D uSampler;
uniform mediump vec2 uScreenSize;

varying highp vec2 vTextureCoord;

void main() {
    vec4 color = texture2D(uSampler, vTextureCoord);
    // if (length(color.rgb) <= 0.0 || color.a <= 0.0) {
        float x = 1.0 / uScreenSize.x;
        float y = 1.0 / uScreenSize.y;
        vec4 horizEdge = vec4(0.0);
        horizEdge -= texture2D(uSampler, vec2(vTextureCoord.x - x, vTextureCoord.y - y)) * 1.0;
        horizEdge -= texture2D(uSampler, vec2(vTextureCoord.x - x, vTextureCoord.y    )) * 2.0;
        horizEdge -= texture2D(uSampler, vec2(vTextureCoord.x - x, vTextureCoord.y + y)) * 1.0;
        horizEdge += texture2D(uSampler, vec2(vTextureCoord.x + x, vTextureCoord.y - y)) * 1.0;
        horizEdge += texture2D(uSampler, vec2(vTextureCoord.x + x, vTextureCoord.y    )) * 2.0;
        horizEdge += texture2D(uSampler, vec2(vTextureCoord.x + x, vTextureCoord.y + y)) * 1.0;
        vec4 vertEdge = vec4(0.0);
        vertEdge -= texture2D(uSampler, vec2(vTextureCoord.x - x, vTextureCoord.y - y)) * 1.0;
        vertEdge -= texture2D(uSampler, vec2(vTextureCoord.x    , vTextureCoord.y - y)) * 2.0;
        vertEdge -= texture2D(uSampler, vec2(vTextureCoord.x + x, vTextureCoord.y - y)) * 1.0;
        vertEdge += texture2D(uSampler, vec2(vTextureCoord.x - x, vTextureCoord.y + y)) * 1.0;
        vertEdge += texture2D(uSampler, vec2(vTextureCoord.x    , vTextureCoord.y + y)) * 2.0;
        vertEdge += texture2D(uSampler, vec2(vTextureCoord.x + x, vTextureCoord.y + y)) * 1.0;
        vec3 edge = sqrt((horizEdge.rgb * horizEdge.rgb) + (vertEdge.rgb * vertEdge.rgb));
        color.rgb += edge / 20.0;
    // }

    gl_FragColor = color;
}