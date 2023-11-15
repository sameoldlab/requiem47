// https://gist.github.com/CodyJasonBennett/34c36b91719171c45ec50e850dc38a34
/**
 * Matches against GLSL shader outputs.
 */
const VARYING_REGEX = /[^\w](?:varying|out)\s+\w+\s+(\w+)\s*;/g

/**
 * Adds line numbers to a string with an optional starting offset.
 */
const lineNumbers = (source: string, offset = 0): string => source.replace(/^/gm, () => `${offset++}:`)

/**
 * Gets the appropriate WebGL data type for a data view.
 */
const getDataType = (data: ArrayBufferView): number | null => {
  switch (data.constructor) {
    case Float32Array:
      return 5126 // FLOAT
    case Int8Array:
      return 5120 // BYTE
    case Int16Array:
      return 5122 // SHORT
    case Int32Array:
      return 5124 // INT
    case Uint8Array:
    case Uint8ClampedArray:
      return 5121 // UNSIGNED_BYTE
    case Uint16Array:
      return 5123 // UNSIGNED_SHORT
    case Uint32Array:
      return 5125 // UNSIGNED_INT
    default:
      return null
  }
}

/**
 * Represents compute input data.
 */
export interface WebGLComputeInput {
  /**
   * Input data view.
   */
  data: ArrayBufferView
  /**
   * The size (per vertex) of the data array. Used to allocate data to each vertex.
   */
  size: number
  /**
   * The size (per instance) of the data array. Used to allocate data to each instance.
   */
  divisor?: number
  /**
   * Flags this input for update.
   */
  needsUpdate?: boolean
}

/**
 * WebGLCompute constructor parameters. Accepts a list of program inputs and compute shader source.
 */
export interface WebGLComputeOptions {
  instances?: number
  inputs: Record<string, WebGLComputeInput>
  compute: string
}

/**
 * Represents a compute result.
 */
export type WebGLComputeResult = Record<string, Float32Array>

/**
 * Represents internal compiled state.
 */
export interface Compiled {
  program: WebGLProgram
  VAO: WebGLVertexArrayObject
  transformFeedback: WebGLTransformFeedback
  buffers: Map<string, WebGLBuffer>
  containers: Map<string, Float32Array>
  length: number
}

/**
 * WebGLCompute constructor parameters. Accepts a list of program inputs and compute shader source.
 */
export interface WebGLComputeOptions {
    instances?: number
    inputs: Record<string, WebGLComputeInput>
    compute: string
  }

/**
 * Constructs a WebGL compute program via transform feedback. Can be used to compute and serialize data from the GPU.
 */
export class WebGLCompute {
  readonly gl: WebGL2RenderingContext
  private _fragmentShader: WebGLShader
  private _compiled = new Map<WebGLComputeOptions, Compiled>()

  constructor(gl = document.createElement('canvas').getContext('webgl2')!) {
    this.gl = gl

    this._fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER)!
    this.gl.shaderSource(this._fragmentShader, '#version 300 es\nvoid main(){}')
    this.gl.compileShader(this._fragmentShader)
  }

  /**
   * Compiles a transform feedback program from compute options.
   */
  compile(options: WebGLComputeOptions): Compiled {
    let compiled = this._compiled.get(options)
    if (compiled) {
      this.gl.bindVertexArray(compiled.VAO)
      for (const [name, buffer] of compiled.buffers) {
        const input = options.inputs[name]
        if (!input.needsUpdate) continue

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer)
        this.gl.bufferData(this.gl.ARRAY_BUFFER, input.data, this.gl.DYNAMIC_READ)
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null)

        input.needsUpdate = false
      }
      this.gl.bindVertexArray(null)

      return compiled
    }

    // Parse outputs from shader source
    const outputs = Array.from(options.compute.matchAll(VARYING_REGEX)).map(([, varying]) => varying)

    // Compile shaders, configure output varyings
    const program = this.gl.createProgram()!

    const vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER)!
    this.gl.shaderSource(vertexShader, options.compute)
    this.gl.compileShader(vertexShader)

    this.gl.attachShader(program, vertexShader)
    this.gl.attachShader(program, this._fragmentShader)

    this.gl.transformFeedbackVaryings(program, outputs, this.gl.SEPARATE_ATTRIBS)
    this.gl.linkProgram(program)

    const shaderError = this.gl.getShaderInfoLog(vertexShader)
    if (shaderError) throw `Error compiling shader: ${shaderError}\n${lineNumbers(options.compute)}`

    const programError = this.gl.getProgramInfoLog(program)
    if (programError) throw `Error compiling program: ${this.gl.getProgramInfoLog(program)}`

    this.gl.detachShader(program, vertexShader)
    this.gl.detachShader(program, this._fragmentShader)
    this.gl.deleteShader(vertexShader)

    // Init VAO state (input)
    const VAO = this.gl.createVertexArray()!
    this.gl.bindVertexArray(VAO)

    let length = 0

    const buffers = new Map<string, WebGLBuffer>()
    for (const name in options.inputs) {
      const input = options.inputs[name]

      const buffer = this.gl.createBuffer()!
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer)
      this.gl.bufferData(this.gl.ARRAY_BUFFER, input.data, this.gl.STATIC_READ)

      const location = this.gl.getAttribLocation(program, name)

      const slots = Math.min(4, Math.max(1, Math.floor(input.size / 3)))
      for (let i = 0; i < slots; i++) {
        this.gl.enableVertexAttribArray(location + i)

        if (input.data instanceof Float32Array) {
          this.gl.vertexAttribPointer(location, input.size, this.gl.FLOAT, false, 0, 0)
        } else {
          const dataType = getDataType(input.data)!
          this.gl.vertexAttribIPointer(location, input.size, dataType, 0, 0)
        }

        if (input.divisor) this.gl.vertexAttribDivisor(location + i, input.divisor)
      }

      buffers.set(name, buffer)
      length = Math.max(length, (input.data as unknown as ArrayLike<number>).length / input.size)

      input.needsUpdate = false
    }
    this.gl.bindVertexArray(null)

    // Init feedback state (output)
    const transformFeedback = this.gl.createTransformFeedback()!
    this.gl.bindTransformFeedback(this.gl.TRANSFORM_FEEDBACK, transformFeedback)

    const containers = new Map<string, Float32Array>()
    for (let i = 0; i < outputs.length; i++) {
      const output = outputs[i]
      const data = new Float32Array(length)
      containers.set(output, data)

      const buffer = this.gl.createBuffer()!
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer)
      this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.STATIC_COPY)
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null)
      buffers.set(output, buffer)

      this.gl.bindBufferBase(this.gl.TRANSFORM_FEEDBACK_BUFFER, i, buffer)
    }
    this.gl.bindTransformFeedback(this.gl.TRANSFORM_FEEDBACK, null)

    compiled = { program, VAO, transformFeedback, buffers, containers, length }
    this._compiled.set(options, compiled)

    return compiled
  }

  /**
   * Runs and reads from the compute program.
   */
  compute(options: WebGLComputeOptions): WebGLComputeResult {
    const compiled = this.compile(options)

    // Run compute
    this.gl.useProgram(compiled.program)
    this.gl.bindVertexArray(compiled.VAO)
    this.gl.bindTransformFeedback(this.gl.TRANSFORM_FEEDBACK, compiled.transformFeedback)
    this.gl.enable(this.gl.RASTERIZER_DISCARD)

    this.gl.beginTransformFeedback(this.gl.POINTS)
    this.gl.drawArraysInstanced(this.gl.POINTS, 0, compiled.length, options.instances ?? 1)
    this.gl.endTransformFeedback()

    this.gl.useProgram(null)
    this.gl.bindVertexArray(null)
    this.gl.bindTransformFeedback(this.gl.TRANSFORM_FEEDBACK, null)
    this.gl.disable(this.gl.RASTERIZER_DISCARD)

    // Read output buffer data
    const output: WebGLComputeResult = {}
    for (const [name, data] of compiled.containers) {
      const buffer = compiled.buffers.get(name)!

      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer)
      this.gl.getBufferSubData(this.gl.ARRAY_BUFFER, 0, data)
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null)

      output[name] = data
    }

    return output
  }

  /**
   * Disposes the compute pipeline from GPU memory.
   */
  dispose(): void {
    this.gl.deleteShader(this._fragmentShader)
    for (const [, compiled] of this._compiled) {
      this.gl.deleteProgram(compiled.program)
      this.gl.deleteVertexArray(compiled.VAO)
      this.gl.deleteTransformFeedback(compiled.transformFeedback)
      compiled.buffers.forEach((buffer) => this.gl.deleteBuffer(buffer))
    }
    this._compiled.clear()
  }
}

        
    

const renderer = new WebGLCompute()
const result = renderer.compute({
  instances: 1,
  inputs: {
    source: {
      data: new Float32Array([1, 1, 1, 1, 1, 1]),
      size: 1,
    //   needsUpdate: false
    },
  },
  compute: /* glsl */ `#version 300 es
    in float source;
    out float result;
    void main() {
      result = source + float(gl_VertexID);
    }
  `,

})

// { result: Float32Array(5) [0, 2, 4, 6, 8] }
console.log(result)
