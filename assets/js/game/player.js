class Player extends Entity {
    /**
     * Create a new Player
     * 
     * @param { string } name - The name of the Player
     * @param { Vector } position - The Vector position of the Player
     * @param { string } color - The color string of the Player
     * @param { number } radius - The radius of the Player
     * @param { string } skin - The image skin URL of the Player
     */
    constructor(name = "Player", position, color, radius = 6, skin = null) {
        super(name, position, color, radius, skin)
    }
}