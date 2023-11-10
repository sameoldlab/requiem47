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
    flock: (arg0: Boid[]) => void
  }
  const BOID_COUNT = 200
  const PARTICLE_SIZE = 6

  ////////////////
  //   BOID
  ////////////////
  function boid(): Boid {
    const position = new vec3().random().subScalar(0.5).multiplyScalar(10000)
    const velocity = new vec3().random().multiplyScalar(500)
    const acceleration = new vec3()
    const maxSpeed = 12

    const flock = (boids: Boid[]) => {
      console.log(acceleration)
      // Pass
      acceleration.add(separate(boids)).add(align(boids)).add(cohere(boids))
      // normalize acceleration. Seems ok without it (both or none) Forms spheres instead of cubes
      .normalize()
      .multiplyScalar(maxSpeed)
    }

    const update = () => {
      position.add(velocity)
      velocity.add(acceleration).clampScalar(-maxSpeed, maxSpeed)
      acceleration.multiplyScalar(0)

      // Quick Passthorugh
      if (Math.abs(position.x) >= 150) position.x = position.x % 150
      if (Math.abs(position.y) >= 100) position.y = position.y % 100
      if (Math.abs(position.z) >= 100) position.z = -position.z % 100

      return position
    }
    const neighbors = (boids: Boid[], rule) => {
      const radius = 40
      let total = 0
      let steer = new vec3()
      for (let other of boids) {
        if (
          //   position !== other.position &&
          position.distanceTo(other.position) < radius
        ) {
          if (position === other.position) {
          }
          rule(other, steer)
          total++
        }
      }

      return { total, vec: steer }
    }

    // Separation
    const separate = (boids: Boid[]) => {
      const { total, vec } = neighbors(boids, (other, vec) => {
        vec.add(other.velocity)
      })

      return new vec3()
    }

    // Alignment
    const align = (boids: Boid[]) => {
      const { total, vec } = neighbors(boids, (other, v) => {
        v.add(other.velocity)
      })

      if (total) {
        vec.divideScalar(total).sub(velocity)
        .clampScalar(-maxSpeed, maxSpeed)
      }
      return vec
    }

    // Cohesion
    const cohere = (boids: Boid[]) => {
      const { total, vec } = neighbors(boids, (other, v) => {
        v.add(other.position)
      })

      if (total) {
        vec
          .divideScalar(total)
          .sub(position)
          .sub(velocity)
          .clampScalar(-maxSpeed, maxSpeed)
      }
      return vec
    }

    return {
      position,
      velocity,
        //   acceleration,
      update,
      flock,
    }
  }

  ////////////////
  //   FLOCK
  ////////////////
  /**
   * Number of Boids in scene.
   * Do not increase beyone 400
   * */
  const flock = [] as Boid[]
  for (let i = 0; i < BOID_COUNT; i++) {
    flock.push(boid()) // Do not "optimize"
  }

  function mesh() {
    const geometry = new T.BufferGeometry()
    const material = new T.PointsMaterial({ size: PARTICLE_SIZE })

    // Runs once when added to scene
    const posArray = new Float32Array(BOID_COUNT * 3)
    flock.forEach((b, i) => {
      ;[posArray[i * 3], posArray[i * 3 + 1], posArray[i * 3 + 2]] =
        b.position.toArray()
    })

    const mesh = new T.Points(geometry, material)

    // Runs every frame
    function update() {
      //   console.log(flock[32])
      const posArray = new Float32Array(BOID_COUNT * 3)
      flock.forEach((b, i) => {
        b.flock(flock)
        b.update()
        ;[posArray[i * 3], posArray[i * 3 + 1], posArray[i * 3 + 2]] =
          b.position.toArray()
      })

      geometry.setAttribute('position', new T.BufferAttribute(posArray, 3))

      const elapsedTime = clock.getElapsedTime()
      if (mouse.x > 0) {
        const dampTime = elapsedTime * 0.01
        mesh.rotation.x = -mouse.y * dampTime
        mesh.rotation.y = -mouse.x * dampTime
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
  camera.position.z = 300
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
