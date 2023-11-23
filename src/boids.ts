import { Vector3 } from 'three'
import {vec3, type Boid} from './utils'

export const boidParams = {
  count: 5000, 
  particleSize: 5,
  BOUNDS: new vec3(400, 600, 1500),
  speed: 4,

  //Consider two level of separate scale; boid to bot  + group to group
  separate: {
    threshold: 16,
    strength: 0.5,
  },
  align: {
    radius: 60, //Should be higher than s.threshold
    strength: 24,
  },
  cohere: {
    radius: 46,
    strength: 3,
  },
}

// TODO: change to generic name and type
const boid = (
  position = new vec3()
    .random()
    .subScalar(0.5)
    .multiply(boidParams.BOUNDS),
  velocity = new vec3().random().subScalar(0.5).multiplyScalar(9)
): Boid => ({
  position,
  velocity,
})

const separate = new vec3()
const align = new vec3()
const cohere = new vec3()
const weightAngle = new vec3(.9, 0.75, 1)

function flock(boid, boids, acceleration: Vector3) {
  const { position, velocity } = boid
  let totalS = 0,
    totalA = 0,
    totalC = 0

  separate.set(0, 0, 0)
  align.set(0, 0, 0)
  cohere.set(0, 0, 0)

  for (let other of boids) {
    if (boid === other) break
    const distance = position.distanceTo(other.position)

    if (distance < boidParams.separate.threshold) {
      totalS++
      separate.add(
        new vec3()
          .subVectors(position, other.position)
          .divideScalar(distance)
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
  if (totalS)
    separate
      .multiplyScalar(1 / totalS)
      .normalize()
      .sub(velocity)
      .multiplyScalar(boidParams.separate.strength)
  // Significantly less interesting without limiting sampling to fov
  if (totalA)
    align
      .multiplyScalar(1 / totalA)
    //   .normalize()
      // .sub(velocity)
      .multiplyScalar(boidParams.align.strength)

  if (totalC)
    cohere
      .multiplyScalar(1 / totalC)
      .normalize()
      .sub(velocity)
      .multiplyScalar(boidParams.cohere.strength)

  acceleration
  .add(bounding(position))
    .add(separate)
    .add(align)
    .add(cohere)
    .multiplyScalar(0.25) // add Mass
    // .multiply(weightAngle)
  // normalize acceleration. Seems ok without it (both or none) Forms spheres instead of cubes
  // .normalize()
  // .multiplyScalar(boidParams.speed)
  //   applyForce(boid, acceleration)
  return acceleration
}

function bounding(position) {
  const vect = new vec3()
  const { x, y, z } = position
  const { abs, sign } = Math
  const { BOUNDS } = boidParams
  if (abs(x) > BOUNDS.x) vect.setX(sign(x) * -(abs(x)-BOUNDS.x))
  if (abs(y) > BOUNDS.y) vect.setY(sign(y) * -(abs(y)-BOUNDS.y))
  if (abs(z) > BOUNDS.z) vect.setZ(sign(z) * -(abs(z)-BOUNDS.z))
  return vect
}

function applyForce(obj: Boid, acceleration) {
  const { position, velocity } = obj
  velocity.add(acceleration).normalize().multiplyScalar(boidParams.speed)
  position.add(velocity)
  return position
}

// Flee

// Seek

export { boid, flock, applyForce }
