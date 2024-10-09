# Robotron 4303
# Design and Implementation

![robotron](https://github.com/user-attachments/assets/2e0501a0-d4fb-419f-8b3f-6e9ad27074fd)

## 1. Control Scheme
- **Mouse**: Aim
- **Spacebar**: Shoot
- **WASD**: Movement

## 2. Play Area

### BSP Tree Generation
The game map is generated using a BSP (Binary Space Partitioning) tree, a data structure that recursively divides space into halves. This ensures a well-structured yet varied map layout, enhancing gameplay.

- **Root**: [0, 0, 1200, 900] Depth: 0
- **L**: [0, 0, 400, 900] Depth: 1
    - **L**: [0, 0, 400, 500] Depth: 2
    - **R**: [0, 500, 400, 400] Depth: 2
- **R**: [400, 0, 800, 900] Depth: 1
    - **L**: [400, 0, 800, 300] Depth: 2
        - **L**: [400, 0, 400, 300] Depth: 3
        - **R**: [800, 0, 400, 300] Depth: 3
    - **R**: [400, 300, 800, 600] Depth: 2
        - **L**: [400, 300, 400, 600] Depth: 3
        - **R**: [800, 300, 400, 600] Depth: 3

Figure 1 shows the BSP tree of the level.

### Rooms and Corridors
Leaf nodes in the BSP tree represent potential rooms, with corridors connecting them, ensuring all rooms are accessible and interconnected.

### Grid Representation
The final layout is represented as a grid, where each cell is part of a room, corridor, or wall. This grid simplifies collision detection and pathfinding.

Figure 2 shows the grid system representation of the wall rectangles.

### Collision Detection System
The game uses a **quadtree** structure for optimized collision detection, particularly for walls and obstacles. Each object is inserted into the smallest node that can fully contain it, improving query efficiency.

### Implementation Challenges
Challenges included ensuring the rooms were well-sized for gameplay and balancing corridor placement to enhance the game’s pacing and difficulty.

## 3. Quadtree Structure

### Implementation
- **Initialization**: The quadtree is initialized to encompass the entire game area.
- **Insertion**: Level boundaries (walls) and obstacles are inserted into the smallest node.
- **Subdivision**: Nodes exceeding their capacity subdivide into four child nodes.
- **Querying**: Collision queries are optimized by only checking nearby entities in the quadtree.

### Collision Detection
Using a quadtree reduces the computational complexity of collision detection from O(n²) to O(n log n).

### Challenges and Solutions
Managing objects that span multiple quadrants required careful consideration to maintain performance and ensure accurate collision detection.

## 4. Robots

### Default Robot
The default robot wanders randomly, switching to a seeking state when within 200 pixels of the player. Robots use radar to detect players, adding a dynamic threat level.

### Terminator Robot
The terminator robot actively seeks human family members within a 200-pixel radius, adding urgency to protect them.

### Transformer Robot
This robot converts human family members into drone robots, introducing additional gameplay challenges.

### Drone Robot
Drones are fast, flying robots that use **A* pathfinding** to navigate the map efficiently, avoiding obstacles but not walls.

## 5. Human Family

### Behavioral Dynamics
- **Wandering and Avoidance**: Family members wander and avoid robots, adding to the game's strategic complexity.
- **Seeking the Player**: Once within 200 pixels of the player, they seek safety, encouraging the player to protect them.

### Scoring and Rescue Mechanics
Each family member carries a score value, and rescuing them rewards the player. Figure 4 shows a successful rescue of a family member.

## 6. Obstacles

### Design and Placement
Obstacles are randomly placed in rooms, influencing movement and strategy. Contact with an obstacle results in immediate death for the player.

### Player Interaction
Players can shoot obstacles to trigger an explosion, destroying nearby robots. Figure 5 shows an obstacle being exploded.

## 7. Power-Ups

### Design and Activation
- **Double Score**: Doubles points for a limited time.
- **Invincibility**: Grants temporary immunity to damage.

Figure 6 shows a double points power-up.

### Visual and Auditory Cues
Power-ups last for 5 seconds and display flashing messages on the screen. Figure 7 shows the power-up label.

## 8. The Player Character

The player has infinite ammo but only one life. Once hit by a robot or obstacle, the game is over. The **quadtree** is used for collision detection, ensuring smooth navigation.

## 9. Wave Management

### Wave Composition and Scaling
The wave management system scales difficulty by increasing the number and type of enemies in each wave. Figure 9 shows the spawn logic of humans in separate rooms.

### Spawn Logic
The system ensures fair play by checking obstacle clearance and minimum player distance during spawning.

### Procedural Generation
Procedurally generated enemies, humans, and obstacles ensure each playthrough is unique, enhancing replayability.

---

**Conclusion**:  
*Robotron 4303* combines procedural generation, advanced AI, and strategic gameplay elements to create a dynamic and replayable game experience. With diverse enemy AI behaviors, a wave management system, and a variety of obstacles and power-ups, players must constantly adapt their strategies to overcome the game's challenges.
