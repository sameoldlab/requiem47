const vert = /* glsl */`#version 300 es
void main() {
  gl_Position = vec4(0,0,0,1);
  gl_PointSize = 150.;
}`;

const frag = /*glsl*/`#version 300 es
precision mediump float;
out vec4 fragColor;
void main() {
  fragColor = vec4(1.,1.,0.,1.);
}`;

const canvas = document.getElementById('model') as HTMLCanvasElement
const gl = canvas.getContext('webgl2')

if (!gl) {
    throw Error ("WebGL 2 not available")
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

gl.linkProgram(program)

if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.log(gl.getShaderInfoLog(vertexShader))
    console.log(gl.getShaderInfoLog(fragmentShader))
}
gl.useProgram(program)
gl.drawArrays(gl.POINTS, 0, 1)


// gl.transformFeedbackVaryings(program, ['position', 'color'],gl.INTERLEAVED_ATTRIBS)
// gl.linkProgram(program)

// const tfo = gl.createTransformFeedback()
// gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK,tfo)
// gl.deleteTransformFeedback(tfo)

// const tfBuffer = gl.createBuffer()
// gl.bindBuffer(gl.ARRAY_BUFFER, tfBuffer)
// gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER,0,tfBuffer)                                                              