<script lang="ts">
    import { onMount } from "svelte";

	let canvas: HTMLCanvasElement
	let ctx: CanvasRenderingContext2D
	onMount(()=> {
        if (!canvas) return Error('canvas not found')
		ctx = canvas.getContext('2d')
	})
    	
			
</script>
	<div class="view">
		<canvas bind:this={canvas}/>
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
