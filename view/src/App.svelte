<script lang="ts">
	import {Canvas, Layer, type Render} from 'svelte-canvas'
	let canvas: HTMLCanvasElement 
	let render: Render
	const z = 30 //feed this into "camera" 
	const PPI = 40
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
					9.1,
					.38,
					${(Math.random()*80)+12} 
				)`;
				//Convert hue to an array of preset values
				ctx.fillRect(
					map(x, PPI, width*(Math.random())),
					map(y, PPI, height*(Math.random())),
					width/PPI*(Math.random()*16)+1, 
					height/PPI*(Math.random()*16)+1,
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
