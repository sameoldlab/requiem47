import * as THREE from 'three'
const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()

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


const renderer = new THREE.WebGLRenderer({ canvas })
renderer.setSize(frame.width, frame.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

//////////////////////////////////////////////////////////////
//   SCENE
//////////////////////////////////////////////////////////////

// Particles
const particle = {
  geometry: new THREE.BufferGeometry(),
  material: new THREE.PointsMaterial({
    transparent: true,
    size: 0.01,
  }),
  count: 5000,
}

const posArray = new Float32Array(particle.count * 3)
for (let i = 0; i < particle.count * 3; i++) {
  posArray[i] = (Math.random() - 0.5) * 5
}
particle.geometry.setAttribute(
  'position',
  new THREE.BufferAttribute(posArray, 3)
)
const particles = new THREE.Points(particle.geometry, particle.material)
scene.add(particles)

// Boids






// Camera
const camera = new THREE.PerspectiveCamera(
    50,
    frame.width / frame.height,
  )
  camera.position.z = 2
  scene.add(camera)

//////////////////////////////////////////////////////////////////////////////
//   ANIMATE
///////////////////////////////////////////////////////////////////////////////

const clock = new THREE.Clock()
const animate = () => {
  const elapsedTime = clock.getElapsedTime()

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


