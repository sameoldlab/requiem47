<script lang="ts">
	import {Canvas, Layer, type Render} from 'svelte-canvas'
	let canvas: HTMLCanvasElement 
	let render: Render
	const PPI = 20
 	const map = (x, b, d) => x/b * d;
	   	
	$: render =({context: ctx, width, height}) => {
		console.log(height, width)
		
		ctx.font = `${width / 10}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'tomato';
    ctx.fillText('hello world', width / 2, height / 2);
	
		for(let x =0; x<PPI; x++) {
			for(let y =0; y<PPI; y++) {
							
				ctx.fillStyle = `oklch(
					37,
					.5,
					${(Math.random()*220)+120} 
				)`;
				//Convert hue to an array of preset values
				ctx.fillRect(
					map(x, PPI, width),
					map(y, PPI, height), 
					width/PPI, 
					height/PPI,
				)
			
		}}
	}		
</script>
	<div class="view">
		<Canvas bind:this={canvas}>
			<Layer {render}/>
		</Canvas>
		<div class="view-controls">.</div>
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
