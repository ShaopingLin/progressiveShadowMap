highp float;
highp int;
uniform sampler2D texture1;
uniform sampler2D texture2;
uniform int iterations;
varying vec2 vUv;
void main() {
    vec4 s1 = texture2D( texture1, vUv );
    vec4 s2 = texture2D( texture2, vUv );

    gl_FragColor = mix( s1, s2,  1./float(iterations) ); 
    gl_FragColor.a = 1.0;
}