class Particle {
    value = 100;
    velocity = new Vector();

    /**
     * 
     * @param {Vector} position - The Vector position of the Particle
     * @param {string} color - The color string of the Particle
     * @param {number} radius - The radius of the Particle
     */
    constructor(position, color, radius = 2) {
        this.position = position;
        this.color = color;
        this.radius = radius;
        this.value = Utilities.random(50, 150);
    }

    update() {
        this.draw();
    }

    collides(particle) {
        const direction = Vector.sum(this.position, Vector.multiply(this.velocity, new Vector(10, 10)));
        const lerp_direction = Vector.lerp(this.position, direction, .1);

        return  lerp_direction.x >= particle.position.x - this.scale &&
                lerp_direction.x < particle.position.x + this.scale &&
                lerp_direction.y >= particle.position.y - this.scale &&
                lerp_direction.y < particle.position.y + this.scale
    }

    get_eaten() {
        this.move_to(new Vector(
            Utilities.random(50, canvas_width - 50),
            Utilities.random(50, canvas_height - 50)
        ));
        this.value = Utilities.random(50, 150);
    }

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
     * 
     * @param {Vector} position 
     */
    move_to(position) {
        this.position = position;
    }

    move(force) {
        this.velocity.sum(force);
        this.velocity.multiply(new Vector(0.5, 0.5));
        this.position.sum(this.velocity);

        if (this.position.x <= 0 || this.position.x >= canvas_width) {
            this.velocity.x *= -1;
        }
        
        if (this.position.y <= 0 || this.position.y >= canvas_height) {
            this.velocity.y *= -1;
        }
    }
}