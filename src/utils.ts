import * as T from 'three'

export const scene = new T.Scene()
export const vec3 = T.Vector3 // Sanity sugar

export type Boid = {
    position: T.Vector3
    velocity: T.Vector3
}