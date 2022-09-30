/**
 * Particle class that represents food for the Entities
 * 
 * @class
 * @constructor
 * @public
 */
class Particle {
    constructor() {
        /**
         *  The Vector position of the Particle
         * @type { Vector }
         * @public
         */
        this.position = new Vector(
            Utilities.random(50, canvas_width - 50),
            Utilities.random(50, canvas_height - 50)
        );
        this.color = Color.get_rgb_string(
            Utilities.random(0, 255),
            Utilities.random(0, 255),
            Utilities.random(0, 255)
        );
        this.radius = 2;
        this.points = Utilities.random(50, 150);
    }

    /**
     * Update the Particle
     */
    update() {
        this.draw();
    }

    /**
     * When the Particle gets eaten, it gets removed from the DB and destroyed
     */
    get_eaten() {
        firebase.database().ref('particles/' + this.position.x + 'x' + this.position.y).remove();
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
}