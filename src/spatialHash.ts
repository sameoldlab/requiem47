import { Vector3 } from 'three'
import { boidParams } from './boids'
import { Boid, vec3 } from './utils'

boidParams.particleSize
boidParams.BOUNDS
// x4 the diameter of the largest object radius
const cellSize =
  Math.max(
    boidParams.separate.threshold,
    boidParams.align.radius,
    boidParams.cohere.radius
  ) * 5
const conversion = 1 / cellSize

// const hashTable = new Map()

const getHash = (position, conversion) => {
  const { x, y, z } = position
  const hash =
    (Math.floor(x *conversion) + Math.floor(y *conversion)) *
      boidParams.BOUNDS.y +
    Math.floor(z *conversion) * boidParams.BOUNDS.z
  return hash
}

export const registerObject = (
  object: Boid,
  table: Map<number, Set<Boid> >,
	conversion = 1 / cellSize
) => {
  const hash = getHash(object.position, conversion)
  const key = table.get(hash)
  if (!key) {
    const values = new Set([object])

    return table.set(hash, values)
  }
  key.add(object)
}

export const findNearby = (
  position: Vector3,
  table: Map<number, Set<Boid> >,
	conversion = 1 / cellSize
): Set<Boid> | undefined => table.get(getHash(position, conversion))

function updateObject() {
  //Given an objects identifier
  //check if it's cell has has changed
  //if so: delete from cell and calculate new cell and insert
}

function spatialHashGrid(bounds, dimensions) {
  const cells = new Map()

  function _insert(client) {
    const { x, y, z } = client.position
  }

  return {
    register: (position, size) => {
      const client = {
        position,
        size,
        indices: undefined,
      }
      _insert(client)
      return client
    },

    updateClient: (client) => {},
  }
}
