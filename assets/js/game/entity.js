/**
 * Entity class that holds data for the Game
 * 
 * @class
 * @constructor
 * @public
 */
class Entity {
    id = null;
    is_alive = true;
    velocity = new Vector();
    direction = new Vector();
    points = 0;

    /**
     * Create a new Entity
     * 
     * @param { string } name - The name of the Entity
     * @param { Vector } position - The Vector position of the Entity
     * @param { string } color - The color string of the Entity
     * @param { number } radius - The radius of the Entity
     * @param { string } skin - The image skin URL of the Entity
     */
    constructor(name = "Entity", position, color, radius = 6, skin = null) {
        /**
         *  The name of the Entity
         * @type { string }
         * @public
         */
        this.name = name;

        /**
         *  The Vector position of the Entity
         * @type { Vector }
         * @public
         */
        this.position = position;

        this.color_rgb = color;

        this.border_color = Color.get_rgb_string(
            color.r - 20,
            color.g - 20,
            color.b - 20
        );

        this.color = Color.get_rgb_string(
            color.r,
            color.g,
            color.b
        );

        this.radius = radius;
        this.skin = skin;
    }

    /**
     * Update the Entity
     */
    update() {
        if (this.is_alive) {
            this.move();
            this.clamp_position();
            this.draw();
        }
    }

    /**
     * Draw the Entity
     */
    draw() {
        this.draw_circle();
        this.draw_skin();
        this.draw_name();
        this.draw_direction_arrow();
    }

    draw_circle() {
        context.beginPath();
        context.fillStyle = this.color;
        context.strokeStyle = this.border_color;
        context.arc(
            this.position.x,
            this.position.y,
            this.radius * 2,
            0,
            2 * Math.PI
        );
        context.lineWidth = 5;
        context.fill();
        context.stroke();
        context.closePath();
    }

    draw_skin() {
        if (this.skin !== null) {
            const image = new Image();
            image.src = this.skin;
            context.drawImage(
                image,
                this.position.x - this.radius * 1.5,
                this.position.y - this.radius * 1.5,
                this.radius * 3,
                this.radius * 3
            );
        }
    }

    draw_name() {
        context.textAlign = "center";
        context.fillStyle = "white";
        context.strokeStyle = "black";
        context.lineWidth = 1;
        context.font = "bold " + this.radius + "px Arial";
        context.fillText(this.name, this.position.x, this.position.y + this.radius * .25);
        context.strokeText(this.name, this.position.x, this.position.y + this.radius * .25);
    }

    draw_direction_arrow() {
        var h = this.radius * (Math.sqrt(3) / 2);
        const arrow_position = Vector.sum(this.position, Vector.multiply(this.direction, new Vector(this.radius * 3, this.radius * 3)));

        context.beginPath();
        context.strokeStyle = "#ff0000";

        context.moveTo(arrow_position.x, arrow_position.y + (-h / 2));
        context.lineTo(arrow_position.x + (-this.radius / 2), arrow_position.y + (h / 2));
        context.lineTo(arrow_position.x + (this.radius / 2), arrow_position.y + (h / 2));
        context.lineTo(arrow_position.x, arrow_position.y + (-h / 2));
        
        context.stroke();
        context.fill();
        
        context.closePath();
    }

    /**
     * Set the direction Vector of the Entity
     * 
     * @param { Vector } direction 
     */
    set_direction(direction) {
        this.direction = direction;
    }

    /**
     * Check if this Entity has collided with any Particle or other Entity and eats it.
     * 
     * @param { Particle[] | null } particles - The Particles to check collision with
     * @param { Entity[] | null } entities - The Entities to check collision with
     */
    check_collision(particles, entities) {
        if (particles !== null) {
            var particle = this.collides(particles);
            if (particle !== undefined) {
                this.eat_particle(particle);
            }
        }

        if (entities !== null) {
            var entity = this.collides(entities);
            if (entity !== undefined) {
                if (entity.is_alive && this.is_alive) {
                    if (this.radius > entity.radius) {
                        this.eat_entity(entity);
                    } else {
                        entity.eat_entity(this);
                    }
                }
            }
        }
    }

    /**
     * Return the Particle or Entity that this Entity has collided with
     * 
     * @param { Particle[] | Entity[] } others - Particles or Entities to check collision with
     * @returns { Particle | Entity } The Particle or Entity that this Entity has collided with
     */
    collides(others) {
        return others.find(other => {
            return  other.position.x >= this.position.x - this.radius * 2 &&
                    other.position.x <  this.position.x + this.radius * 2 &&
                    other.position.y >= this.position.y - this.radius * 2 &&
                    other.position.y <  this.position.y + this.radius * 2;
        });
    }

    /**
     * Grow this Entity by value
     * 
     * @param { number } value - The value to grow
     */
    grow(value) {
        this.radius += value;
    }

    /**
     * Eat a particle
     * 
     * @param { Particle } particle - The Particle to eat
     */
    eat_particle(particle) {
        console.log("The", particle, "has been eaten by the", this)
        this.grow(particle.points * 0.001);
        this.points += particle.points;
        particle.get_eaten(this.id);
    }

    /**
     * Eat another Entity
     * 
     * @param { Entity } entity - The Entity to eat
     */
    eat_entity(entity) {
        console.log("The", entity, "has been eaten by the", this)
        this.grow(entity.radius);
        this.points += entity.points;
        entity.get_eaten();
    }

    /**
     * Get eaten
     */
    get_eaten() {
        this.is_alive = false;
        firebase.database().ref('players/' + this.id).remove();
    }

    /**
     * Split in half
     */
    split() {
        console.log("split")
    }

    /**
     * Update position
     */
    move() {
        const damp_number = (1 / this.radius) * 10;
        const damp_vector = new Vector(damp_number, damp_number);
        const direction_damped = Vector.multiply(this.direction, damp_vector);

        this.velocity.sum(direction_damped);
        this.velocity.multiply(new Vector(0.5, 0.5));
        this.position.sum(this.velocity);
    }

    /**
     * Clamp the position to the Canvas.
     * If the Entity goes out of frame,
     * it will appear from the other side
     */
    clamp_position() {
        if (this.position.x < 0) {
            this.position.x = canvas_width;
        }

        if (this.position.x > canvas_width) {
            this.position.x = 0;
        }

        if (this.position.y < 0) {
            this.position.y = canvas_height;
        }

        if (this.position.y > canvas_height) {
            this.position.y = 0;
        }
    }
}