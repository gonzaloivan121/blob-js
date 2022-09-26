class Player extends Entity {
    /**
     * 
     * @param {string} name - The name of the Entity
     * @param {Vector} position - The Vector position of the Entity
     * @param {string} color - The color string of the Entity
     * @param {number} radius - The radius of the Entity
     */
    constructor(name = "Entity", position, color) {
        super(name, position, color)
    }

    input(input) {
        var damp_number = (1 / this.radius) * 6;
        var damp_vector = new Vector(damp_number, damp_number);
        this.velocity = Vector.multiply(input, damp_vector);
        //this.velocity = input;
    }
}