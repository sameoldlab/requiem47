import * as T from 'three'

export const scene = new T.Scene()
export const vec3 = T.Vector3 // Sanity sugar

export type Boid = {
    position: T.Vector3
    velocity: T.Vector3
    acceleration: T.Vector3
    update: () => T.Vector3
    flock: (arg0: Boid[]) => void
  }