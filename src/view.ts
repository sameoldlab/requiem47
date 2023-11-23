/* <div class="view">
<!-- {boid.position} -->
<Canvas bind:this={canvas} autoclear={false}>
	<Layer {setup} />
</Canvas>
<div class="view-controls"></div>
</div>
 */
const frame = {
	width: window.innerWidth,
	height: window.innerHeight,
}
const mouse = { x: 0, y: 0 }

const canvas = document.getElementById('view') as HTMLCanvasElement
const context = canvas.getContext('2d')

const z = 30 //feed this into "camera"
const PPI = 20
const map = (x, b, d) => (x / b) * d

const setup = ({ context: ctx, width, height }) => {
	for (let x = 0; x < PPI; x++) {
		for (let y = 0; y < PPI; y++) {
			ctx.fillStyle = `oklch(
					100%,
					.12,
					${Math.random() * 90 + 220}
				)`

			ctx.font = `8px sans-serif`
			ctx.fillText(`${x}, ${y}`, map(x, PPI, width), map(y, PPI, height))

			ctx.fillRect(
				map(x, PPI, width),
				map(y, PPI, height),
				width / PPI,
				height / PPI
			)
		}
	}
}

const render = ({ context: ctx, width, height }) => {
	ctx.fillStyle = `oklch(
					100%,
					.12,
					${Math.random() * 90 + 220}
				)`

	ctx.fillRect(
		map($boid.x % PPI, PPI, width),
		map($boid.y % PPI, PPI, height),
		(width / PPI) * (Math.random() * 1) + 1,
		(height / PPI) * (Math.random() * 1) + 1
	)
}
