class Entity {
    is_alive = true;
    velocity = new Vector();
    points = 0;

    /**
     * 
     * @param {string} name - The name of the Entity
     * @param {Vector} position - The Vector position of the Entity
     * @param {string} color - The color string of the Entity
     * @param {number} radius - The radius of the Entity
     */
    constructor(name = "Entity", position, color, radius = 6) {
        this.name = name;
        this.position = position;
        this.color = color;
        this.radius = radius;
    }

    update() {
        if (this.is_alive) {
            this.move();
            this.draw();
        }
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

        context.textAlign = "center";
        context.fillStyle = "white";
        context.font = this.radius + "px Arial";
        context.fillText(this.name, this.position.x, this.position.y + this.radius * .25);
    }

    /**
     * 
     * @param {Particle[]|null} particles 
     * @param {Entity[]|null} entities 
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
                if (this.radius > entity.radius) {
                    this.eat_entity(entity);
                } else {
                    entity.eat_entity(this);
                }
            }
        }
    }

    collides(others) {
        return others.find(o => {
            return o.position.x >= this.position.x - this.radius * 2 &&
                o.position.x < this.position.x + this.radius * 2 &&
                o.position.y >= this.position.y - this.radius * 2 &&
                o.position.y < this.position.y + this.radius * 2;
        });
    }

    /**
     * 
     * @param {Particle} particle 
     */
    eat_particle(particle) {
        this.radius += particle.value * 0.01;
        this.points += particle.value;
        particle.get_eaten();
    }

    /**
     * 
     * @param {Entity} entity 
     */
    eat_entity(entity) {
        this.radius += entity.points * 0.01;
        this.points += entity.points;
        entity.get_eaten();
    }

    get_eaten() {
        this.is_alive = false;
    }

    move() {
        /*var damp_number = (1 / this.radius) * 4;
        var damp_vector = new Vector(damp_number, damp_number);
        this.velocity.multiply(damp_vector);*/

        this.velocity.sum(this.velocity);
        this.velocity.multiply(new Vector(0.5, 0.5));
        this.position.sum(this.velocity);

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