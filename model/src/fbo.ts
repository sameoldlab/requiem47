const vert = /* glsl */ `#version 300 es
in float inVelocity;
in float inPosition;

out float outVelocity;
out float outPosition;

void main()
{
    outVelocity = inVelocity + 2.;
    outPosition = inPosition - 4.;
}`

const frag = /*glsl*/ `#version 300 es 
void main() {}`

const canvas = document.getElementById('model') as HTMLCanvasElement
const gl = canvas.getContext('webgl2')
if (!gl) throw Error('WebGL 2 not available')
// Create GL Program and attach the vertex shader
const program = gl.createProgram()
if (!program) throw Error('program not valid?')


const vertexShader = gl.createShader(gl.VERTEX_SHADER)!
gl.shaderSource(vertexShader, vert)
gl.compileShader(vertexShader)
gl.attachShader(program, vertexShader)

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!
gl.shaderSource(fragmentShader, frag)
gl.compileShader(fragmentShader)
gl.attachShader(program, fragmentShader)

// Attach transform feedback
gl.transformFeedbackVaryings(program, ['outVelocity', 'outPosition'],gl.INTERLEAVED_ATTRIBS)
gl.linkProgram(program)

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.log(gl.getShaderInfoLog(vertexShader))
}
gl.useProgram(program)

// Bind Buffers
const COUNT = 1_000_000
const seed = new Float32Array(COUNT*2).map((_, index)=>index)
console.log(seed)


const buffer1 = gl.createBuffer()
const vao1 = gl.createVertexArray()
bindVaoBuffer(buffer1, vao1, gl)
gl.bufferSubData(gl.ARRAY_BUFFER, 0, seed)

const buffer2 = gl.createBuffer()
const vao2 = gl.createVertexArray()
bindVaoBuffer(buffer2, vao2, gl)


gl.bindVertexArray(null)
gl.bindBuffer(gl.ARRAY_BUFFER, null)

// Ignore empty fragment shader
gl.enable(gl.RASTERIZER_DISCARD)

let vao = vao1
let buffer = buffer2

for (let i  = 0; i  < 10; i ++) {
	gl.bindVertexArray(vao)
	gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER,0,buffer)
	
	gl.beginTransformFeedback(gl.POINTS)
	gl.drawArrays(gl.POINTS,0,COUNT)
	gl.endTransformFeedback()
	gl.bindVertexArray(null)
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER,0,null)

	vao = vao === vao1 ? vao2 : vao1
	buffer = buffer === buffer2 ? buffer1 : buffer2	
}
// gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER,0,null)
gl.disable(gl.RASTERIZER_DISCARD)

const view = new Float32Array(2*COUNT)
gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, buffer1)
gl.getBufferSubData(gl.TRANSFORM_FEEDBACK_BUFFER, 0, view)

console.log(view)

function bindVaoBuffer(buffer, vao, gl: WebGL2RenderingContext) {

	gl.bindVertexArray(vao)
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer)

	gl.vertexAttribPointer(0, 1, gl.FLOAT, false, 8, 0)
	gl.vertexAttribPointer(1, 1, gl.FLOAT, false, 8, 4)
	gl.enableVertexAttribArray(0)
	gl.enableVertexAttribArray(1)
	gl.bufferData(gl.ARRAY_BUFFER, 2*COUNT*4, gl.DYNAMIC_READ)

}