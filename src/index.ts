import * as T from 'three'
import { Pane } from 'tweakpane'
import Stats from 'stats.js'
import { type Boid, vec3 } from './utils'
import { applyForce, boid, boidParams, flock } from './boids'
import { findNearby, registerObject } from './spatialHash'


const mouse = { x: 0, y: 0 }

const canvas = document.getElementById(
  'model'
) as HTMLCanvasElement | null
if (!canvas) throw Error('webgl2 is not available on your browser')

const frame = {
  width: 0,//canvas.width,
  height: window.innerHeight,
}

const context = canvas.getContext('webgl')
// const renderer = new T.WebGLRenderer({
//   canvas,
//   context,
//   preserveDrawingBuffer: true,
// })

// renderer.setSize(frame.width, frame.height)
// renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
// renderer.autoClearColor = true

// const scene = new T.Scene()
//////////////////////////////////////////////////////////////
//   FLOCKING START
//////////////////////////////////////////////////////////////

export const boids = [] as Boid[]
export const grid = new Map()
for (let i = 0; i < boidParams.count; i++) {
  boids[i] = boid()
  registerObject(boids[i], grid)
}

function mesh() {
  const geometry = new T.BufferGeometry()
  const material = new T.PointsMaterial({
    size: boidParams.particleSize,
    fog: true,
    //   sizeAttenuation: true,
    //   vertexColors: true,
  })

  // Runs once when added to scene
  const posArray = new Float32Array(boidParams.count * 3)
  boids.forEach((b, i) => {
    ;[
      posArray[i * 3],
      posArray[i * 3 + 1],
      posArray[i * 3 + 2],
    ] = b.position.toArray()
  })
  geometry.setAttribute(
    'color',
    new T.BufferAttribute(posArray, 3)
  )
  // Pre-allocatting memory for acceleration
    const acceleration = new vec3()
		let len = boidParams.count
		let i =0

  return {
    mesh: new T.Points(geometry, material),
    update: () => {
      // const posArray = new Float32Array(boidParams.count * 3)

      // Loops through all boids in the scene
			console.log(boidParams.count);
			
			while(i < boids.length){
        registerObject(boids[i], grid)
        const fleet = findNearby(boids[i].position, grid)
        if (!fleet) return
				if (fleet.size > 1) {
          flock(boids[i], fleet.keys(), acceleration)
        }

				applyForce(boids[i], acceleration)
			  acceleration.set(0,0,0)
/* 				;[
          posArray[i * 3],
          posArray[i * 3 + 1],
          posArray[i * 3 + 2],
        ] = boids[i].position.toArray() */
				i++
			}
      grid.clear()
			i = 0

      // geometry.setAttribute(
      //   'position',
      //   new T.BufferAttribute(posArray, 3)
      // )
    },
  }
}

const particles = mesh()
// scene.add(particles.mesh) // Might not need to draw these at all by the end... possibly

const cam = { x: 0, y: 0, z: 1000 }

//////////////////////////////////////////////////////////////
//   FLOCKING END
//////////////////////////////////////////////////////////////

const pane = new Pane()
pane.hidden = true
pane.addBinding(boidParams, 'count', {
  min: 1,
  max: 1000,
  step: 1,
})
pane.addBinding(boidParams, 'speed')

pane
  .addBinding(cam, 'z', { min: 10, max: 3000 })
  .on('change', (ev) => {
    camera.position.z = ev.value
  })

const sep = pane.addFolder({
  title: 'Separation',
})
sep.addBinding(boidParams.separate, 'threshold', {
  min: 0,
  max: 100,
})
sep.addBinding(boidParams.separate, 'strength', {
  min: 0,
  max: 10,
})
const align = pane.addFolder({
  title: 'Alignment',
})
align.addBinding(boidParams.align, 'radius', {
  min: 0,
  max: 100,
})
align.addBinding(boidParams.align, 'strength', {
  min: 0,
  max: 10,
})
const cohere = pane.addFolder({
  title: 'Cohesion',
})
cohere.addBinding(boidParams.cohere, 'radius', {
  min: 0,
  max: 100,
})
cohere.addBinding(boidParams.cohere, 'strength', {
  min: 0,
  max: 10,
})

// Camera
const camera = new T.PerspectiveCamera(
  50,
  1,
  0.01,
  2000
)
camera.position.z = cam.z
//   camera.rotation.y = 90
// scene.add(camera)

//////////////////////////////////////////////////////////////////////////////
//   ANIMATE
///////////////////////////////////////////////////////////////////////////////

const stats = Stats()
//   0: fps, 1: ms, 2: mb, 3+: custom
stats.showPanel(0)
stats.showPanel(1)
//   stats.showPanel( 2 );
document.body.appendChild(stats.dom)
// stats.update()



const frameLengthMS = 1000 / 30 //60 fps
let previousTime = 0

function animate(timestamp = 0) {
  if (timestamp - previousTime > frameLengthMS) {
    //   console.log(previousTime)
    stats.begin()
    particles.update()
    // const elapsedTime = clock.getElapsedTime()
    stats.end()
    previousTime = timestamp
  }

  window.requestAnimationFrame(animate)
  // renderer.render(scene, camera)
}
  animate()

/* window.addEventListener('resize', () => {
  // Update sizes
  frame.width = window.innerWidth
  frame.height = window.innerHeight

  // Update camera
  camera.aspect = frame.width / frame.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(frame.width, frame.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}) */

document.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX
  mouse.y = e.clientY
})

// Wall Text:
console.info("source: https://github.com/sameoldlab/requiem47");
console.info("https://are.na/requiem-47/requiem-47");
console.info(`
A.) A map may have a structure similar or dissimilar to the structure of the territory.

B.) Two similar structures have similar ‘logical’ characteristics. Thus, if in a correct map, Dresden is given as between Paris and Warsaw, a similar relation is found in the actual territory.

C.) A map is not the actual territory.

D.) An ideal map would contain the map of the map, the map of the map of the map, etc., endlessly…We may call this characteristic self-reflexiveness.`)