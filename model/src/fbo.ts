// [Andrew Adamnson](https://www.youtube.com/@osakaandrew) is the goat
const vert = /* glsl */ `#version 300 es
uniform float uPointSize;
in vec2 aPosition;
layout(location=4) in vec3 aColor;
out vec3 vColor;

void main() {
  vColor = aColor; 
  gl_PointSize = uPointSize;
  gl_Position = vec4(aPosition, 0.0, 1.);
}`

const frag = /*glsl*/ `#version 300 es
precision mediump float;
in vec3 vColor;
out vec4 fragColor;
void main() {
  fragColor = vec4(vColor,1);
}`

const canvas = document.getElementById(
  'model'
) as HTMLCanvasElement
const gl = canvas.getContext('webgl2')

if (!gl) {
  throw Error('WebGL 2 not available')
}

const program = gl.createProgram()!

const vertexShader = gl.createShader(gl.VERTEX_SHADER)!
gl.shaderSource(vertexShader, vert)
gl.compileShader(vertexShader)
gl.attachShader(program, vertexShader)

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!
gl.shaderSource(fragmentShader, frag)
gl.compileShader(fragmentShader)
gl.attachShader(program, fragmentShader)

//Use gl.bindAttribLocation before linking shaders
// gl.bindAttribLocation(program, 6, 'aColor')
// Program that depends on future hardware procgress might ve interesting, no I will not check for prior work.

gl.linkProgram(program)
gl.useProgram(program)


// Get a uniform from the vertex then change it's values. AFTER calling useProgram
// ask GPU for attrib location: gl.getAttribLocation(program,'aDemo')
const uSize = gl.getUniformLocation(program, 'uPointSize')
const aPosition = gl.getAttribLocation(program, 'aPosition')
const aColor = gl.getAttribLocation(program, 'aColor')

gl.enableVertexAttribArray(aPosition)
gl.enableVertexAttribArray(aColor)

const bufferData = new Float32Array([
     .7, -.1,  0,   1,  1,
     .3, -.9,  1,   1,  0,
     -.3, .9,  1,   0,  1,
])

const buffer = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
gl.bufferData(gl.ARRAY_BUFFER, bufferData, gl.STATIC_DRAW)

gl.vertexAttribPointer(
  aPosition,
  2,
  gl.FLOAT,
  false,
  /* 5 floats with four bytes each */ 
  5 * 4,
  0
);

gl.vertexAttribPointer(
    aColor,
    3,
    gl.FLOAT,
    false,
    /* 5 floats with four bytes each */ 
    5 * 4,
    /* offset from array start off floats with four bytes each */ 
    2 * 4
  );

// Set uniform value. Needs to be called once for each draw
// gl.uniform1f(uSize, 40.0)
// gl.drawArrays(gl.POINTS, 0, 3)

gl.uniform1f(uSize, 50.0)
// gl.vertexAttrib1f(location,value)
// gl.drawArrays(gl.POINTS, 0, 2)

gl.drawArrays(gl.TRIANGLES, 0, 3)

console.table({
  uSize: uSize,
  aPosition: aPosition,
  aColor: aColor,
})

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.log(gl.getShaderInfoLog(vertexShader))
    console.log(gl.getShaderInfoLog(fragmentShader))
 }
 console.log(gl.getParameter(gl.MAX_UNIFORM_BLOCK_SIZE))

// gl.transformFeedbackVaryings(program, ['position', 'color'],gl.INTERLEAVED_ATTRIBS)
// gl.linkProgram(program)

// const tfo = gl.createTransformFeedback()
// gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK,tfo)
// gl.deleteTransformFeedback(tfo)

// const tfBuffer = gl.createBuffer()
// gl.bindBuffer(gl.ARRAY_BUFFER, tfBuffer)
// gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER,0,tfBuffer)

