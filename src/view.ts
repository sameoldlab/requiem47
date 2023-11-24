import {boids} from './index'
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
const PPI = 11

/**
 * Map number to a new range
 * @param x Number to be mapped
 * @param param1 Object map from a1-b1 to a2-b2
 * @param param1.a1 start of initial range
 * @returns x in a2-b2
 */
const mapRange = (x:number, {a1=0, b1=1, a2=0, b2}) => ((x - a1) /(b1-a1)) *(b2-a2) + a2


const setup = ({ context:ctx, width, height }) => {
	for (let x = 0; x < PPI; x++) {
		for (let y = 0; y < PPI; y++) {
			let vx, vy
			
			vx = mapRange(x,{b1:PPI-1, a2: -200, b2:200})
			vy = mapRange(y,{b1:PPI-1, a2: -300, b2:300})

			ctx.fillStyle = `oklch(
					78%,
					.31,
					${Math.random() * 50 + 20}
				)`

			ctx.font = `8px sans-serif`
			ctx.fillText(`${vx}, ${vy}`, mapRange(x, {b1:PPI, b2: width}), mapRange(y, {b1:PPI, b2:height})+8)
			
/* 			ctx.fillRect(
				map(x, PPI, width),
				map(y, PPI, height),
				width / PPI,
				height / PPI
			) */
		}
	}

	ctx.save()
}
setup({context, ...frame})


const render = ({ context: ctx, width, height }) => {
	ctx.fillStyle = '#111'
	ctx.fillRect(0,0,width,height)
	ctx.restore()

	boids.forEach((b, i)=>{
		const {x: px, y:py, z: pz}  = b.position
		const {x: vx, y:vy, z: vz}  = b.velocity

		if(vx > vy) console.log('horizontal')
		if(vx < vy) console.log('vertical')
		ctx.fillStyle = `oklch(
					50%,
					.42,
					${(pz%255) + 120}
				)`

		if(pz > z-50 && pz < z+50) {
			// console.log(i, b.position)
			if(vx > vy *1.5) {
				ctx.fillRect(
					mapRange(px,{a1:-250, b1:250, b2: width}),
					mapRange(py,{a1:-350, b1:350, b2: width}),
					(width / PPI) * (Math.random() * vx) + 1,
					(height / PPI) //* (Math.random() * 1) + 1
					)
			} else if (vy > vx *1.5) {
				ctx.fillRect(
					mapRange(px,{a1:-250, b1:250, b2: width}),
					mapRange(py,{a1:-350, b1:350, b2: width}),
					(width / PPI) ,//* (Math.random() * 1) + 1,
					(height / PPI) * (Math.random() * vy) + 1
					)
			}
			// if(vx < vy) console.log('vertical')
			
			}
	})
}



const frameLengthMS = 1000 / 60 //60 fps
let previousTime = 0

function animate(timestamp = 0) {
	if (timestamp - previousTime > frameLengthMS) {
		//   console.log(previousTime)
		render({context, ...frame})
  
    previousTime = timestamp
  }

  window.requestAnimationFrame(animate)
}
animate()