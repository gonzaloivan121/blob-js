class Player extends Entity {
    /**
     * Create a new Player
     * 
     * @param { string } name - The name of the Player
     * @param { Vector } position - The Vector position of the Player
     * @param { string } color - The color string of the Player
     */
    constructor(name = "Player", position, color) {
        super(name, position, color)
    }
}