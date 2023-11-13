import {vec3, type Boid} from './utils'

export const boidParams = {
  count: 1000, //10-13ms / frame
  particleSize: 3,
  speed: 2, //Oddly very high numbers seem to work fine

  //Consider two level of separate scale; boid to bot  + group to group
  separate: {
    threshold: 16,
    strength: 4,
  },
  align: {
    radius: 40, //Should be higher than s.threshold
    strength: 2,
  },
  cohere: {
    radius: 12,
    strength: 0,
  },
}
const BOUNDS = new vec3(500, 150, 500)

// TODO: change to generic name and type
const boid = (
  position = new vec3().random().subScalar(0.5).multiplyScalar(200),
  velocity = new vec3().random().subScalar(0.5).multiplyScalar(99)
): Boid => ({
  position,
  velocity,
})

function flock(boid, boids: Boid[]) {
  const { position, velocity } = boid
  const acceleration = new vec3()

  let totalS = 0,
    totalA = 0,
    totalC = 0
  const separate = new vec3()
  const align = new vec3()
  const cohere = new vec3()

  for (let other of boids) {
    if (position !== other.position) {
      const distance = position.distanceTo(other.position)

      if (distance < boidParams.separate.threshold) {
        totalS++
        separate.add(
          new vec3().subVectors(position, other.position).divideScalar(distance)
        )
      }
      if (distance < boidParams.align.radius) {
        totalA++
        align.add(other.velocity)
      }
      if (distance < boidParams.cohere.radius) {
        totalC++
        cohere.add(other.position)
      }
    }
  }
  if (totalS)
    separate
      .divideScalar(totalS)
      .normalize()
      .sub(velocity)
      .multiplyScalar(boidParams.separate.strength)
  // Significantly less interesting without limiting sampling to fov
  if (totalA)
    align
      .divideScalar(totalA)
      .normalize()
      // .sub(velocity)
      .multiplyScalar(boidParams.align.strength)

  if (totalC)
    cohere
      .divideScalar(totalC)
      .normalize()
      .sub(velocity)
      .multiplyScalar(boidParams.cohere.strength)

  acceleration
    .add(separate)
    .add(align)
    .add(cohere)
    .add(bounding(position))
    .divideScalar(3) // add Mass
    // normalize acceleration. Seems ok without it (both or none) Forms spheres instead of cubes
    .normalize()
    .multiplyScalar(boidParams.speed)
  applyForce(boid, acceleration)
}

function bounding(position) {
  const vect = new vec3()
  const { x, y, z } = position
  const { abs, sign } = Math
  if (abs(x) > BOUNDS.x) vect.setX(sign(x) * -15)
  if (abs(y) > BOUNDS.y) vect.setY(sign(y) * -15)
  if (abs(z) > BOUNDS.z) vect.setZ(sign(z) * -15)
  return vect
}

function applyForce(obj, acceleration) {
  const { position, velocity } = obj
  velocity.add(acceleration).normalize().multiplyScalar(boidParams.speed)
  position.add(velocity)
  return position
}

// Flee

// Seek

export { boid, flock }
