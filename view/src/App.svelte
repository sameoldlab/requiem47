<script lang="ts">
	import {Canvas, Layer, type Render} from 'svelte-canvas'
	import boid from './boid'

	let canvas: HTMLCanvasElement 
	let render: Render
	let setup: Render
	const z = 30 //feed this into "camera" 
	const PPI = 20
 	const map = (x, b, d) => x/b * d;
	   	
	$: setup =({context: ctx, width, height}) => {
		
		for(let x =0; x<PPI; x++) {
			for(let y =0; y<PPI; y++) {
							

				ctx.fillStyle = `oklch(
					100%,
					.12,
					${(Math.random()*90)+220}
				)`;

				ctx.font = `8px sans-serif`;
				ctx.fillText(`${x}, ${y}`,
				map(x, PPI, width),
				map(y, PPI, height),
				);
				
				
				ctx.fillRect(
					map(x, PPI, width),
					map(y, PPI, height),
					width/PPI, 
					height/PPI,
				) 
				
		}}
	}	
	
	$: render =({context: ctx, width, height}) => {

		ctx.fillStyle = `oklch(
					100%,
					.12,
					${(Math.random()*90)+220}
				)`;

		ctx.fillRect(
						map($boid.x%PPI, PPI, width),
						map($boid.y%PPI, PPI, height),
						width/PPI*(Math.random()*1)+1, 
						height/PPI*(Math.random()*1)+1,
						) 
	}	
</script>
	<div class="view">
		<!-- {boid.position} -->
		<Canvas bind:this={canvas} autoclear={false}>
			<Layer {setup} />
		</Canvas>
		<div class="view-controls"></div>
	</div>

<style>

	.view {
		width: 50vw;
		height: min(90%, 1000px);
		display: flex;
		justify-content: center;
		align-items: center;
		margin: auto;
	}
	canvas {
		background: white;
		height: 100%;
		aspect-ratio: 1/1.618;
		margin: .5rem;
	}
</style>
