/**
 * Obstacle class that splits an Entity and makes it lose points
 * 
 * @class
 * @constructor
 * @public
 */
class Obstacle {
    /**
     * Create a new Obstacle
     * 
     * @param { Vector } position - The Vector position of the Obstacle
     * @param { string } color - The color string of the Obstacle
     * @param { number } radius - The radius of the Obstacle
     */
    constructor(position, color, radius = 2) {
        /**
         *  The Vector position of the Obstacle
         * @type { Vector }
         * @public
         */
        this.position = position;
        this.color = color;
        this.radius = radius;
        this.value = Utilities.random(50, 150);
    }

    /**
     * Update the Obstacle
     */
    update() {
        this.draw();
    }

    /**
     * Draw the Particle
     */
    draw() {
        context.beginPath();
        context.fillStyle = this.color;
        context.arc(
            this.position.x,
            this.position.y,
            this.radius * 2,
            0,
            2 * Math.PI
        );
        context.fill();
    }

    /**
     * Move the Particle to a set position
     * 
     * @param { Vector } position - The position that the Particle will move to
     */
    move_to(position) {
        this.position = position;
    }
}