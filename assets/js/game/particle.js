/**
 * Particle class that represents food for the Entities
 * 
 * @class
 * @constructor
 * @public
 */
class Particle {
    /**
     * Create a new Particle
     * 
     * @param { Vector } position - The Vector position of the Particle
     * @param { string } color - The color string of the Particle
     * @param { number } radius - The radius of the Particle
     */
    constructor(position, color, radius = 2) {
        /**
         *  The Vector position of the Particle
         * @type { Vector }
         * @public
         */
        this.position = position;
        this.color = color;
        this.radius = radius;
        this.value = Utilities.random(50, 150);
    }

    /**
     * Update the Particle
     */
    update() {
        this.draw();
    }

    /**
     * When the Particle gets eaten, it moves to a new random position and it's value is set to a new random number
     */
    get_eaten() {
        this.move_to(new Vector(
            Utilities.random(50, canvas_width - 50),
            Utilities.random(50, canvas_height - 50)
        ));
        this.value = Utilities.random(50, 150);
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