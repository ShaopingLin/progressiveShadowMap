
uniform vec2 screenSize;
uniform sampler2D blendTexture;
void main(){
  vec2 vUv = vec2(gl_FragCoord.x/screenSize.x,gl_FragCoord.y/screenSize.y);
  vec3 color = texture2D(blendTexture,vUv).rgb;
  gl_FragColor = vec4(color,1.);
}