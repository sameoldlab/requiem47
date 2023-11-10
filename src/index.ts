import * as T from 'three'
const canvas = document.querySelector('canvas.webgl')
if (canvas) {
  const scene = new T.Scene()
  const vec3 = T.Vector3 // Sanity sugar

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
  //   SCENE
  //////////////////////////////////////////////////////////////

  // Boids
  function boid() {
    const position = new vec3().random().subScalar(0.5).multiplyScalar(5)
    const velocity = new vec3().random().subScalar(.5)

    const acceleration = new vec3()
    const maxSpeed = 4

    const align = () => {
        
    }

    const update = () => {
      position.add(velocity)
      velocity.add(acceleration)

      return position 
    }

    const seek = (target: T.Vector3) => {
      const dersired = new vec3().subVectors(target, position)
      dersired.normalize()
      dersired.multiplyScalar(maxSpeed)

      // Reynold's Formula
      const steer = new vec3().subVectors(dersired, velocity)
      velocity.angleTo(steer)
    }

    return {
      position,
      velocity,
      acceleration,
      update,
    }
  }

  const flock = [] as {
    position: T.Vector3
    velocity: T.Vector3
    acceleration: T.Vector3
    update: () => T.Vector3
  }[] //bro. just make a type
  const count = 2000
  for (let i = 0; i < count; i++) {
    flock.push(boid()) // Do not "optimize"
  }

  function mesh() {
    const geometry = new T.BufferGeometry()
    const material = new T.PointsMaterial({ size: 10 })

    // Runs once when added to scene
    const posArray = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      ;[posArray[i], posArray[i + 1], posArray[i + 2]] =
        flock[i].position.toArray()
    }

    const mesh = new T.Points(geometry, material)

    function update() {
      // Runs every frame on update when added to scene
      const posArray = new Float32Array(count * 3)
      for (let i = 0; i < count; i++) {
        ;[posArray[i], posArray[i + 1], posArray[i + 2]] =
          flock[i].update().toArray()
      }
      geometry.setAttribute('position', new T.BufferAttribute(posArray, 3))

      const elapsedTime = clock.getElapsedTime()
      if (mouse.x > 0) {
        const dampTime = elapsedTime * 0.0001
        mesh.rotation.x = -mouse.y * dampTime
        mesh.rotation.y = -mouse.x * dampTime
      } else {
        // mesh.rotation.y = 0.025 * elapsedTime
      }
    }
    return {
      mesh,
      update,
    }
  }

  const particles = mesh()
  scene.add(particles.mesh) // Might not nee to draw these at all by the end... possibly

  // Camera
  const camera = new T.PerspectiveCamera(50, frame.width / frame.height)
  camera.position.z = 2000
  scene.add(camera)

  //////////////////////////////////////////////////////////////////////////////
  //   ANIMATE
  ///////////////////////////////////////////////////////////////////////////////

  const clock = new T.Clock()
  const animate = () => {
    particles.update()

    // Render
    window.requestAnimationFrame(animate)
    renderer.render(scene, camera)
  }

  animate()
}
