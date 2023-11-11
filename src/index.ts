import * as T from 'three'
const canvas = document.querySelector('canvas.webgl')
import { Pane } from 'tweakpane'
import { scene, vec3, type Boid } from './utils'
import { boid, boidParams } from './boids' 

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

  const flock = [] as Boid[]
  for (let i = 0; i < boidParams.count; i++) {
    flock.push(
      boid({
        position: new vec3().random().subScalar(0.5).multiplyScalar(200),
        velocity: new vec3().random().subScalar(0.5).multiplyScalar(99),
        acceleration: new vec3(),
      })
    ) // Do not "optimize"
  }

  function mesh() {
    const geometry = new T.BufferGeometry()
    const material = new T.PointsMaterial({ size: boidParams.particleSize })

    // Runs once when added to scene
    const posArray = new Float32Array(boidParams.count * 3)
    flock.forEach((b, i) => {
      ;[posArray[i * 3], posArray[i * 3 + 1], posArray[i * 3 + 2]] =
        b.position.toArray()
    })
    // geometry.setAttribute('position', new T.BufferAttribute(posArray, 3))

    return {
      mesh: new T.Points(geometry, material),
      update: () => {
        const posArray = new Float32Array(boidParams.count * 3)

        flock.forEach((b) => b.flock(flock))
        flock.forEach((b, i) => {
          b.update()
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

  const cam = { x: 0, y: 0, z: 4010 }

  const pane = new Pane()
  pane.addBinding(boidParams, 'count', { min: 1, max: 1000, step: 1 })
  pane.addBinding(boidParams, 'speed')
  pane.addBinding(cam, 'z', { min: 10, max: 3000 }).on
  const sep = pane.addFolder({
    title: 'Separation',
  })
  sep.addBinding(boidParams.separate, 'threshold', {
    title: 'dfs',
    min: 0,
    max: 100,
    step: 1,
  })
  sep.addBinding(boidParams.separate, 'strength', {
    title: 'dfs',
    min: 0,
    max: 10,
    step: 1,
  })
  const align = pane.addFolder({
    title: 'Alignment',
  })
  align.addBinding(boidParams.align, 'radius', {
    title: 'dfs',
    min: 0,
    max: 100,
    step: 1,
  })
  align.addBinding(boidParams.align, 'strength', {
    title: 'dfs',
    min: 0,
    max: 10,
    step: 1,
  })
  const cohere = pane.addFolder({
    title: 'Cohesion',
  })
  cohere.addBinding(boidParams.cohere, 'radius', {
    title: 'dfs',
    min: 0,
    max: 100,
    step: 1,
  })
  cohere.addBinding(boidParams.cohere, 'strength', {
    title: 'dfs',
    min: 0,
    max: 10,
    step: 1,
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
  const animate = () => {
    particles.update()
    // const elapsedTime = clock.getElapsedTime()

    // camera.rotation.y = 0.5 * elapsedTime

    // Render
    window.requestAnimationFrame(animate)
    renderer.render(scene, camera)
  }

  animate()
