import { boidParams } from './boids'
import {boids} from './index'
import { findNearby, registerObject } from './spatialHash'
import { vec3 } from './utils'

/* <div class="view">

<!-- {boid.position} -->
<Canvas bind:this={canvas} autoclear={false}>
	<Layer {setup} />
</Canvas>
<div class="view-controls"></div>
</div>
 */
let boid = boids[5].position
const canvas = document.getElementById('view') as HTMLCanvasElement
if (!canvas) throw Error('webgl2 is not available on your browser')

const context = canvas.getContext('2d')
const dpr = window.devicePixelRatio
const [rect] = canvas.getClientRects()

canvas.width = rect.width*dpr
canvas.height = rect.height*dpr
context?.scale(dpr, dpr)

canvas.style.width = `${rect.width}px`
canvas.style.height = `${rect.height}px`


const frame = {
	width: canvas.width,
	height: canvas.height,
}
const mouse = { x: 0, y: 0 }



const z = 1000 //feed this into "camera"
const PPI = 20

/**
 * Map number to a new range
 * @param x Number to be mapped
 * @param param1 Object map from a1-b1 to a2-b2
 * @param param1.a1 start of initial range
 * @returns x in a2-b2
 */
const mapRange = (x:number, {a1=0, b1=1, a2=0, b2}) => ((x - a1) /(b1-a1)) *(b2-a2) + a2
// const pallette = ['#FF0414','#FF6437','#FFD761', '#FE42AD','#51F1E3']
const pallette = ['#454869','#B1B6C9','#FDFDFD', '#00ABE3','#013274']
// const pallette = ['#001111','white','#13004F', 'aquamarine','#110','indigo','violet']


const setup = ({ context: ctx, width, height }) => {
	
	for (let x = 0; x < PPI; x++) {
		for (let y = 0; y < PPI; y++) {
			let vx, vy

			vx = Math.floor(mapRange(x, { b1: PPI, a2: 0, b2: width }))
			vy = Math.floor(mapRange(y, { b1: PPI, a2: 0, b2: height }))

			// oklch modulos its hue values automatically
			ctx.fillStyle = `oklch(
					78%,
					.31,
					${z * 50 + 20}
				)`

			ctx.strokeStyle = 'white'
			ctx.font = `11px sans-serif`
			// ctx.fillText(
				// `${vx}, ${vy}`,
				// mapRange(x, { b1: PPI, b2: width }),
				// mapRange(y, { b1: PPI, b2: height }) + 8
			// )

			ctx.beginPath()
			ctx.moveTo(vx, vy)
			ctx.lineTo(vx + Math.sin(Math.atan2(vy,vx)) * 25, vy + Math.cos(Math.atan2(vy,vx)) * 25)
			// ctx.lineTo(
			// 	mapRange(x , { b1: PPI+ Math.cos(45)* 100, b2: width+ Math.cos(.3)* 100 }),
			// 	mapRange(y , { b1: PPI+ Math.cos(45)* 100, b2: height+ Math.cos(.3)* 100 })
			// )
			ctx.stroke()

			// ctx.fillRect(
			// 	mapRange(x, { b1: PPI, b2: width }),
			// 	mapRange(y, { b1: PPI, b2: height }),
			// 	width / PPI,
			// 	height / PPI
			// )
		}
	}

	ctx.save()
}
// setup({ context, ...frame })

const render = ({ context: ctx, width, height }) => {
	ctx.fillStyle = `oklch(
		20%
		.42
		${360 / z}
	/.02)`
	// ctx.fillStyle = '#111'
	// ctx.fillStyle = `${pallette[3]}07`

	ctx.fillRect(0, 0, width, height)
	ctx.restore()

	boids.forEach((b, i) => {
		const { x: px, y: py, z: pz } = b.position
		const { x: vx, y: vy, z: vz } = b.velocity

		if (pz > z - 50 && pz < z + 50) {
			ctx.fillStyle = `oklch(
				50%
				.42
				${pz}
				/.62)`


			// ctx.fillStyle = `${pallette[Math.round(mapRange(pz,{a1:z-50, b1: z+50, a2:0, b2:4}))]}88`
			// console.log(mapRange(pz,{a1:z-50, b1: z+50, a2:0, b2:4}))

			// console.log(i, b.position)
			if (vx > vy * 1.5) {
				ctx.fillRect(
					mapRange(px, { a1: -boidParams.BOUNDS.x, b1: boidParams.BOUNDS.x, b2: width }),
					mapRange(py, { a1: -boidParams.BOUNDS.y, b1: boidParams.BOUNDS.y, b2: height }),
					(width / PPI) * (Math.random() * vx) + 1,
					height / PPI //* (Math.random() * 1) + 1
				)
				// ctx.
			} else if (vy > vx * 1.5) {
				ctx.fillRect(
					mapRange(px, { a1: -boidParams.BOUNDS.x, b1: boidParams.BOUNDS.x, b2: width }),
					mapRange(py, { a1: -boidParams.BOUNDS.y, b1: boidParams.BOUNDS.y, b2: height }),
					width / PPI, //* (Math.random() * 1) + 1,
					(height / PPI) * (Math.random() * vy) + 1
				)
			}
			console.log(px)
			
		}
	})
}
const cellSize =
  Math.max(
    boidParams.separate.threshold,
    boidParams.align.radius,
    boidParams.cohere.radius
  ) * 2.35

export const grid = new Map()
for (let i = 0; i < boidParams.count; i++) {
  registerObject(boids[i], grid, 1/cellSize)
}
console.log(grid);

const lines = ({ context: ctx, width, height }) => {
	ctx.fillStyle = `oklch(
		50%
		.42
		${z % 360}
		/.02)`
		// ctx.fillStyle = '#111'
	ctx.fillRect(0, 0, width, height)
	// boids.forEach((b, i) => {
		// const { x: px, y: py, z: pz } = b.position
		// const { x: vx, y: vy, z: vz } = b.velocity

	// if (pz > z - 50 && pz < z + 50) {
	let nearby = 0
	for (let i = 0; i < boidParams.count; i++) {
		registerObject(boids[i], grid)
	}
	for (let x = 50; x < width; x+=80) {
		for (let y = 20; y < height; y+=80) {

			let area = new vec3(
				mapRange(x, { a1: 0, b1: width,  a2: -boidParams.BOUNDS.x, b2:boidParams.BOUNDS.x }),
				mapRange(y, { a1: 0, b1: height, a2: -boidParams.BOUNDS.y, b2:boidParams.BOUNDS.y }),
				z
			)
			const set = findNearby(area,grid, 1/cellSize)
			// ctx.fillText(`${nearby}`,x,y)

			if (!set) break

			nearby = set.size
			ctx.fillStyle = `white`

			const v = new vec3
				let sum = 0
			for (let value of set) {
				v.add(value.velocity)
				sum++
			}
			v.divideScalar(sum)
			//get the general direction of velocity within the set
			ctx.strokeStyle = `oklch(
				80%
				.12
				${(Math.atan2(v.y, v.x)* (180 / Math.PI))/2}
				/1)`
			let i = 0
			while (i < 20){
				ctx.beginPath()
				ctx.moveTo(x,y)
				ctx.lineTo(x + Math.cos(Math.atan2(v.y, v.x)) * v.length() * 4,
									 y + Math.sin(Math.atan2(v.y, v.x)) * v.length() * 4
				)
				ctx.stroke() 
				i++
			}


			// ctx.beginPath()
			// ctx.moveTo(x,y)
			// ctx.lineTo(x + Math.cos(Math.atan2(v.y, v.x)) * 25,
			// 					 y + Math.sin(Math.atan2(v.y, v.x)) * 25
			// 					 )
			// ctx.stroke() 
			// ctx.lineTo(
			// 	mapRange(x , { b1: PPI+ Math.cos(45)* 100, b2: width+ Math.cos(.3)* 100 }),
			// 	mapRange(y , { b1: PPI+ Math.cos(45)* 100, b2: height+ Math.cos(.3)* 100 })
			// )


		}
	}
	grid.clear()
	// }})
}


const frameLengthMS = 1000  //60 fps
let previousTime24 = 0
let previousTime60 = 0

function animate(timestamp = 0) {

		if (timestamp - previousTime24 > frameLengthMS/24) {
		//   console.log(previousTime)
		render({context, ...frame})
  
		previousTime24 = timestamp
  }
	if (timestamp - previousTime60 > frameLengthMS/60) {
		
		lines({context, ...frame})
		previousTime60 = timestamp

	}
  window.requestAnimationFrame(animate)
}
animate()