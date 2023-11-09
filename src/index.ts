import * as T from 'three'
const canvas = document.querySelector('canvas.webgl')
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

// Particles
const flock = []
const geometry = new T.BufferGeometry()
const material = new T.PointsMaterial({
    transparent: true,
    size: 0.01,
})
const count = 2000


// Boids
function boid() {


  const position = new vec3().random().subScalar(.5).multiplyScalar(5)
  const velocity = new vec3().random()

  const acceleration = new vec3()
  const maxSpeed = 4;

  const update = () => {
    position.add(velocity)
    velocity.add(acceleration)

    // console.log(position)
}

  const seek = (target: T.Vector3) => {
    const dersired = new vec3().subVectors(target, position)
    dersired.normalize()
    dersired.multiplyScalar(maxSpeed)

    // Reynold's Formula
    const steer = new vec3().subVectors(dersired,velocity)
    velocity.angleTo(steer)
  }

  
  return {
    position,
    velocity,
    acceleration,
    update

  } 
}



const posArray = new Float32Array(count * 3)
for (let i = 0; i < count*3; i+=3) {    
    [posArray[i], posArray[i + 1], posArray[i + 2]] = boid().position.toArray()
}
// console.log(posArray)

geometry.setAttribute(
  'position',
  new T.BufferAttribute(posArray, 3)
)
const particles = new T.Points(geometry, material)
scene.add(particles)



// Camera
const camera = new T.PerspectiveCamera(
    50,
    frame.width / frame.height,
  )
  camera.position.z = 2
  scene.add(camera)

//////////////////////////////////////////////////////////////////////////////
//   ANIMATE
///////////////////////////////////////////////////////////////////////////////

const clock = new T.Clock()
const animate = () => {
  const elapsedTime = clock.getElapsedTime()
  boid().update()
  for (let i = 0; i < count*3; i+=3) {    
    [posArray[i], posArray[i + 1], posArray[i + 2]] = boid().update()
}
geometry.setAttribute(
    'position',
    new T.BufferAttribute(posArray, 3)
  )

  if (mouse.x > 0) {
    const dampTime = elapsedTime * 0.0001
    particles.rotation.x = -mouse.y * dampTime
    particles.rotation.y = -mouse.x * dampTime
  } else {
    particles.rotation.y = 0.025 * elapsedTime
  }

  // Render
  renderer.render(scene, camera)
  window.requestAnimationFrame(animate)
}

animate()


