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
  /**
   * @param particleSize: Number of Boids in scene.
   * Do not increase beyond 400
   * */
  const boidParams = {
    count:1000,
    particleSize: 12/3,
    speed: 8,
    radius: 100,
    
    separateRadius: 10,
    separateStrength: 5,

    alignRadius: 80,
    alignStrength: 16,

    cohereRadius: 70,
    cohereStrength: 4,
    

  }
  const ZOOM = 800
  const BOUNDS = new vec3(500, 500, 500)

  type Boid = {
    position: T.Vector3
    velocity: T.Vector3
    acceleration: T.Vector3
    update: () => T.Vector3
    flock: (arg0: Boid[]) => void
  }
  
  ////////////////
  //   BOID
  ////////////////
  function boid(): Boid {
    const position = new vec3().random().subScalar(0.5).multiplyScalar(500)
    const velocity = new vec3().random().subScalar(.5)//.multiplyScalar(3)
    const acceleration = new vec3()

    const flock = (boids: Boid[]) => {
        let totalS = 0
        let totalA = 0
        let totalC = 0
        let separate = new vec3()
        let align = new vec3()
        let cohere = new vec3()
        for (let other of boids) {
          if (position !== other.position) {
           const distance = position.distanceTo(other.position)

            if(distance < boidParams.separateRadius) {
                totalS++
                const weightedVelocity = new vec3().subVectors  (position, other.position)
                                                   .divideScalar(distance)
                                                // .normalize()
                separate.add(weightedVelocity)
            }
            if(distance < boidParams.alignRadius) {
                totalA++
                align.add(other.velocity) //A
            }
            if(distance < boidParams.cohereRadius) {
                totalC++
                cohere.add(other.position) //C
            }
        } 
        }
        if(totalS) separate .divideScalar(totalS)
                            .sub(velocity)
                            .multiplyScalar(boidParams.separateStrength)

        if(totalA) align    .divideScalar(totalA)
                            .sub(velocity)
                            .clampScalar(-boidParams.speed, boidParams.speed)
                            .multiplyScalar(boidParams.alignStrength)

        if(totalC) cohere   .divideScalar(totalC)
                            .sub(position).sub(velocity)
                            .clampScalar(-2, 3)
                            .multiplyScalar(boidParams.cohereStrength)
        
        
      acceleration
        .add(separate)
        .add(align)
        .add(cohere)
        // normalize acceleration. Seems ok without it (both or none) Forms spheres instead of cubes
        .normalize()
        .multiplyScalar(boidParams.speed)
    }

    return {
      position,
      velocity,
      acceleration,
      flock,
      update: () => {
        position.add(velocity)
        velocity.add(acceleration).clampScalar(-boidParams.speed, boidParams.speed)
        acceleration.multiplyScalar(0)
  
        // Quick Passthorugh
        if (Math.abs(position.x) >= BOUNDS.x/2) position.x = -(position.x % BOUNDS.x)
        if (Math.abs(position.y) >= BOUNDS.y/2) position.y = -(position.y % BOUNDS.y)
        if (Math.abs(position.z) >= BOUNDS.z/2) position.z = -(position.z % BOUNDS.z)
  
        return position
      }
    }
  }

  ////////////////
  //   FLOCK
  ////////////////
  const flock = [] as Boid[]
  for (let i = 0; i < boidParams.count; i++) {
    flock.push(boid()) // Do not "optimize"
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

        flock.forEach((b) => {b.flock(flock)})       
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

  const box = new T.Box3()
  const bounding = new T.BoxGeometry(BOUNDS.x, BOUNDS.y, BOUNDS.z)
  bounding.computeBoundingBox()
  const boundingWire = new T.Box3Helper(bounding.boundingBox)
  scene.add(boundingWire)

  // Camera
  const camera = new T.PerspectiveCamera(
    50,
    frame.width / frame.height,
    0.01,
    4000
  )
  camera.position.z = ZOOM
  scene.add(camera)

  //////////////////////////////////////////////////////////////////////////////
  //   ANIMATE
  ///////////////////////////////////////////////////////////////////////////////

  const clock = new T.Clock()
  const animate = () => {
    particles.update()
    const elapsedTime = clock.getElapsedTime()

    // camera.rotation.y = 0.5 * elapsedTime

    // box.copy(bounding.boundingBox).applyMatrix4(bounding.matrixWorld)

    // Render
    window.requestAnimationFrame(animate)
    renderer.render(scene, camera)
  }

  animate()
}
