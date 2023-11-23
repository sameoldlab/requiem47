import { writable } from "svelte/store"

let boid = writable({x:10, y:12})

const frameLengthMS = 1000 /8 //60 fps
let previousTime = 0
function animate(timestamp = 0) {
  if (timestamp - previousTime > frameLengthMS) {
		boid.update(v=>{
			v.x += 3
			v.y += .5
		return v
	})
		boid = boid
    previousTime = timestamp
  }

  window.requestAnimationFrame(animate)
}; 
animate()


export default boid
