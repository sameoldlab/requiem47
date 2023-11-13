import * as T from 'three'
const canvas = document.querySelector('canvas.webgl')
import { Pane } from 'tweakpane'
import Stats from 'stats.js'
import { scene, type Boid } from './utils'
import { boid, boidParams, flock } from './boids'

const frame = {
  width: window.innerWidth,
  height: window.innerHeight,
}
const mouse = { x: 0, y: 0 }

window.addEventListener('resize', () => {
  // Update sizes
  frame.width = window.innerWidth
  frame.height = window.innerHeight

  // Update camera
  camera.aspect = frame.width / frame.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(frame.width, frame.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

document.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX
  mouse.y = e.clientY
})

const renderer = new T.WebGLRenderer({ canvas })
renderer.setSize(frame.width, frame.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

//////////////////////////////////////////////////////////////
//   FLOCKING
//////////////////////////////////////////////////////////////

const boids = [] as Boid[]
for (let i = 0; i < boidParams.count; i++) {
  boids[i] = boid()
}

  function mesh() {
    const geometry = new T.BufferGeometry()
    const material = new T.PointsMaterial({
      size: boidParams.particleSize,
      fog: true,
      sizeAttenuation: true,
    })

    // Runs once when added to scene
    const posArray = new Float32Array(boidParams.count * 3)
    boids.forEach((b, i) => {
      ;[posArray[i * 3], posArray[i * 3 + 1], posArray[i * 3 + 2]] =
        b.position.toArray()
    })
    // geometry.setAttribute('position', new T.BufferAttribute(posArray, 3))

    return {
      mesh: new T.Points(geometry, material),
      update: () => {
        const posArray = new Float32Array(boidParams.count * 3)

        boids.forEach((b, i) => {
          flock(b, boids)
        // });         boids.forEach((b, i) => {
          ;[posArray[i * 3], posArray[i * 3 + 1], posArray[i * 3 + 2]] =
            b.position.toArray()
        })
        geometry.setAttribute('position', new T.BufferAttribute(posArray, 3))

        const elapsedTime = clock.getElapsedTime()
        if (mouse.x > 0) {
          const dampTime = elapsedTime * 0.01
          // mesh.rotation.x = -mouse.y * dampTime
          // mesh.rotation.y = -mouse.x * dampTime
        } else {
          // mesh.rotation.y = 0.5 * elapsedTime
        }
      },
    }
  }

  const particles = mesh()
  scene.add(particles.mesh) // Might not need to draw these at all by the end... possibly

  const cam = { x: 0, y: 0, z: 400 }

  const pane = new Pane()
  pane.addBinding(boidParams, 'count', { min: 1, max: 1000, step: 1 })
  pane.addBinding(boidParams, 'speed')
  pane.addBinding(cam, 'z', { min: 10, max: 3000 }).on
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
    frame.width / frame.height,
    0.01,
    4000
  )
  camera.position.z = cam.z
  scene.add(camera)

  //////////////////////////////////////////////////////////////////////////////
  //   ANIMATE
  ///////////////////////////////////////////////////////////////////////////////

  const clock = new T.Clock()
  const stats = Stats()
//   0: fps, 1: ms, 2: mb, 3+: custom
  stats.showPanel( 0 );
  stats.showPanel( 1 );
//   stats.showPanel( 2 );
  document.body.appendChild( stats.dom );
// stats.update()
  const anime = () => {
      stats.begin()
      particles.update()
    // const elapsedTime = clock.getElapsedTime()
    stats.end()
    // camera.rotation.y = 0.5 * elapsedTime

    // Render
    window.requestAnimationFrame(animate)
    renderer.render(scene, camera)
  }

//   anime()


const frameLengthMS = 1000/70;//60 fps
let previousTime = 0;
// The previous answers seem to ignore the intended design of requestAnimationFrame, and make some extraneous calls as a result. requestAnimationFrame takes a callback, which in turn takes a high precision timestamp as its argument. So you know the current time and you don't need to call Date.now(), or any other variant, since you already have the time. All that’s needed is basic arithmetic:
function animate(timestamp=0){
    if(timestamp - previousTime > frameLengthMS){
    //   console.log(previousTime)
   stats.begin()
   particles.update()
   // const elapsedTime = clock.getElapsedTime()
   stats.end()  
    previousTime = timestamp;
  }
  window.requestAnimationFrame(animate)
  renderer.render(scene, camera)

}
animate()