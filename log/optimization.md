# Optimization

I need to optimize the boid calculation to grow sims beyond 200 boids. 

---
# Look at
- space partitioning
- sweep and prune (broad phase; performance bump isn't that big. esp. if scene is dynamic)
- KD Trees, Quad Trees (for 2d), Oct Trees (for 3d), Bounding Volume Hierarchies
- AABB
 
AFAIU Spatial Partitioning, a.k.a. Spatial Hashing, means separating the space--DAMN that hurts to write-- so collisions only need to be detected within a small partition. This has increased memory implications as the no. of partitions increases. Additionally, we might end up with a large number of empty partitions, wasted memory. KD Trees and Quad Trees improve on this by spliting the partitions dynamically. *Double check this* Quad trees improve on KD Trees by creating splits such that there is never an overlap of boids in multiple partitions (Having boids limited to a single cell tends to cause bugs).

## Notes:
Space part. is a significant improvement all things considered should look at the implementation complexity before over engineering a solution that I don't need.
Getting reports that Spatial partitioning, Spatial hashing, and Binary Space Partition trees are in fact different things
P.S. Please remember to move this to an independent function. Absol utely do not check and calculate neigbors thre separate times for each rule.

### Additional resources:
- http://www.red3d.com/cwr/boids/
- Don't you just love bookmarking paper linked on YouTube with no intention of reading them!? :D
- [Neat AI](https://www.youtube.com/watch?v=i0OHeCj7SOw)
- When to use which: https://stackoverflow.com/questions/99796/when-to-use-binary-space-partitioning-quadtree-octree
- [Optimization of Large-Scale, real-time simulations by spatial hashing](https://web.archive.org/web/20220521115147/http://www.cs.ucf.edu/~jmesit/publications/scsc%202005.pdf)
- Comparision https://dinotree-book.netlify.app/ch1-dinotree-vs-other.html

Spatial hash tables looking *Unreasonably Effective*
> Rebuilding a tre per frare is at best O(NlonN) for N object whearas rebuilding a has table is O(N)


      // Quick Passthorugh
      if      (Math.abs(position.x) >=  300) {
        velocity.x = -velocity.x
        position.add(velocity)
    } else if (Math.abs(position.x) <= -300) {
        velocity.x = -velocity.x
        position.add(velocity)
    }
      if      (Math.abs(position.y) >=  200) {
        velocity.y = -velocity.y
        position.add(velocity)
    } else if (Math.abs(position.y) <= -200) {
        velocity.y = -velocity.y
        position.add(velocity)
    }
      if      (Math.abs(position.z) >=  200) {
        velocity.z = -velocity.z
        position.add(velocity)
    } else if (Math.abs(position.z) <= -200) {
        velocity.z = -velocity.z
        position.add(velocity)
    }