Space to adjust the boid behaviour wiothout breaking the simulation is very narrow. Displaying SAC weights this obfuscated through [[Frame]] for a third party to adjust would in most cases reduce the emergent behaviour of boids. I should look into other ways "players" can influence state without breaking it. 

## Ideas
- Add different object types into the scene. These could be obstacles, attractors, predators, leaders, etc.
- Drawing or weighting paths that the boids might follow. long range: let players import/create flow fields, noise, turbulence. Debating between giving them a way to erase paths (then your broken [[Frame]] is your own fault) and heavily limiting what paths can be added 
- Mixing these together: some attractor blooms around happy B1, primary boid flock. Predators can be added to the scene, which chase B1. B1 `fear` increases as predators enter `radius` temporarily boosting maxspeed. Attractor does not grow if there are no nearby B1, Attractor decays if neaby B1 have high `fear`. Render `attractor growth` on [[Frame]]. Render fear on [[Frame]]?
- 

## Notes 
Avoid direct influence from input: Oh, cOoL u clicked and scared them away, just like the 150 other sims since 1997. Plus the effects from this will dissipate in the next 5 minutes. 