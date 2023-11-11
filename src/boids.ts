import {vec3, type Boid} from './utils'

export const boidParams = {
    count: 900,
    particleSize: 3,
    speed: 13, //Oddly very high numbers
    
    //Consider two level of separate scale; boid to bot  + group to group
    separate: {
        threshold:   25,
        strength: 1,
    }, 
    align: {
        radius:      50,
        strength:   2
    },
    cohere: {
        radius:      50,
        strength:   1
    },
}
const BOUNDS = new vec3(500, 500, 500)


export function boid({ position, velocity, acceleration}): Boid {

    function bounding() {
      const vect = new vec3()
      const {x, y, z } = position
      const {abs, sign} = Math
         if (abs(x) > BOUNDS.x) vect.setX(sign(x) * -.05)
         if (abs(y) > BOUNDS.y) vect.setY(sign(y) * -.05)
         if (abs(z) > BOUNDS.z) vect.setZ(sign(z) * -.05)      
        return vect
    }

    return {
      position,
      velocity,
      acceleration,
      flock: (boids: Boid[]) => {
        let totalS = 0
        let totalA = 0
        let totalC = 0
        let separate = new vec3()
        let align = new vec3()
        let cohere = new vec3()
        for (let other of boids) {
          if (position !== other.position) {
            const distance = position.distanceTo(other.position)
  
            if (distance < boidParams.separate.threshold) {
              totalS++
              const weightedVelocity = new vec3()
                .subVectors(position, other.position)
                .normalize()
                .divideScalar(distance)
              separate.add(weightedVelocity)
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
        if (totalS) separate.divideScalar(totalS).normalize()
                            .multiplyScalar(boidParams.separate.strength)
                            .sub(velocity)
  
        if (totalA) align   .divideScalar(totalA).normalize()
                            .multiplyScalar(boidParams.align.strength)
                            .sub(velocity)
  
        if (totalC) cohere  .divideScalar(totalC)
                            .multiplyScalar(boidParams.cohere.strength)
  
        acceleration
          .add(separate)
          .add(align)
          .add(cohere)
          .add(bounding())
          // normalize acceleration. Seems ok without it (both or none) Forms spheres instead of cubes
          // .normalize()
          // .multiplyScalar(boidParams.speed)
      },
      update: () => {
        velocity
          .add(acceleration)
          .clampScalar(-boidParams.speed, boidParams.speed)
        position.add(velocity)
        acceleration.multiplyScalar(0)

        return position
      },
    }
  }