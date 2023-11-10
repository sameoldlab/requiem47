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

  const box = new T.Box3()
  const bounding = new T.BoxGeometry(600, 300, 300)
  bounding.computeBoundingBox()
  
  const boundingWire = new T.Box3Helper(bounding.boundingBox)
  scene.add(boundingWire)

  type Boid = {
    position: T.Vector3
    velocity: T.Vector3
    acceleration: T.Vector3
    update: () => T.Vector3
    flock: () => T.Vector3
  }

  // Boids
  function boid(): Boid {
    const position = new vec3().random().subScalar(0.5).multiplyScalar(300)
    const velocity = new vec3().random().subScalar(1).multiplyScalar(50)
    const acceleration = new vec3()
    const maxSpeed = 20

    const flock = (boids) => {
      const alignment = align(boids)
      //   console.log(alignment)
      acceleration.add(alignment)
      acceleration.normalize()
      acceleration.multiplyScalar(maxSpeed)
    }

    const update = () => {
      position.add(velocity)
      velocity.add(acceleration)

      return position
    }

    const align = (boids: Boid[]) => {
      const radius = 90
      let neighbors = 0
      let steer = new vec3()
      // Absolutely NEEEED to optimize this look at space partitioning, sweep and prune, KD Trees
      for (let other of boids) {
        if (
          position !== other.position &&
          position.distanceTo(other.position) < radius
        ) {
          //   console.log(position.distanceTo(other.position))
          steer.add(other.velocity)
          neighbors++
        }
      }
      // No division by zero
      if (neighbors) {
        steer.clampScalar(-maxSpeed, maxSpeed)
        steer.divideScalar(neighbors)
        // console.log(neighbors,"v: ", velocity,"steer: ", steer)
        steer.sub(velocity)
      }
      return steer
    }

    return {
      position,
      velocity,
      acceleration,
      update,
      flock,
    }
  }

  const count = 200
  const flock = [] as Boid[]
  for (let i = 0; i < count; i++) {
    flock.push(boid()) // Do not "optimize"
  }

  function mesh() {
    const geometry = new T.BufferGeometry()
    const material = new T.PointsMaterial({ size: 6 })

    // Runs once when added to scene
    const posArray = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      ;[posArray[i*3], posArray[i*3 + 1], posArray[i*3 + 2]] =
        flock[i].position.toArray()
      console.log(i*3+2)

    }
    console.log(posArray)

    const mesh = new T.Points(geometry, material)

    // Runs every frame
    function update() {
      //   console.log(flock[32])
      const posArray = new Float32Array(count * 3)
      flock.forEach((b, i) => {
        b.flock(flock)
        b.update()
        ;[posArray[i*3], posArray[i*3 + 1], posArray[i*3 + 2]] =
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
    }
    return {
      mesh,
      update,
    }
  }


  const particles = mesh()
  scene.add(particles.mesh) // Might not need to draw these at all by the end... possibly

  // Edge Detection

  // Camera
  const camera = new T.PerspectiveCamera(
    50,
    frame.width / frame.height,
    0.01,
    4000
  )
  camera.position.z = 500
  scene.add(camera)

  //////////////////////////////////////////////////////////////////////////////
  //   ANIMATE
  ///////////////////////////////////////////////////////////////////////////////

  const clock = new T.Clock()
  const animate = () => {
    particles.update()

    // box.copy(bounding.boundingBox).applyMatrix4(bounding.matrixWorld)

    // Render
    window.requestAnimationFrame(animate)
    renderer.render(scene, camera)
  }

  animate()
}
