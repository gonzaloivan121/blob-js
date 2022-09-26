/**
 * 
 */
class Vector {
    static zero = new Vector(0, 0);
    static up = new Vector(0, -1);
    static down = new Vector(0, 1);
    static left = new Vector(-1, 0);
    static right = new Vector(1, 0);

    /**
     * Create a Vector point
     * @param {number} x - The x value
     * @param {number} y - The y value
     */
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    /**
     * Sums two Vectors
     * 
     * @param {Vector} v1 - Vector 1
     * @param {Vector} v2 - Vector 2
     * @returns {Vector} The resulting Vector
     */
    static sum(v1, v2) {
        return new Vector(v1.x + v2.x, v1.y + v2.y);
    }

    /**
     * Subtracts two Vectors
     * 
     * @param {Vector} v1 - Vector 1
     * @param {Vector} v2 - Vector 2
     * @returns {Vector} The resulting Vector
     */
    static subtract(v1, v2) {
        return new Vector(v1.x - v2.x, v1.y - v2.y);
    }

    /**
     * Multiplies two Vectors
     * 
     * @param {Vector} v1 - Vector 1
     * @param {Vector} v2 - Vector 2
     * @returns {Vector} The resulting Vector
     */
    static multiply(v1, v2) {
        return new Vector(v1.x * v2.x, v1.y * v2.y);
    }

    /**
     * Divides two Vectors
     * 
     * @param {Vector} v1 - Vector 1
     * @param {Vector} v2 - Vector 2
     * @returns {Vector} The resulting Vector
     */
    static divide(v1, v2) {
        return new Vector(v1.x / v2.x, v1.y / v2.y);
    }

    /**
     * Lerps a Vector with another one
     * 
     * @param {Vector} start 
     * @param {Vector} end 
     * @param {number} amount 
     * @returns {Vector}
     */
    static lerp(start, end, amount) {
        return new Vector(
            (1 - amount) * start.x + amount * end.x,
            (1 - amount) * start.y + amount * end.y,
        );
    }

    sum(v) {
        this.x += v.x;
        this.y += v.y;
    }

    subtract(v) {
        this.x -= v.x;
        this.y -= v.y;
    }

    multiply(v) {
        this.x *= v.x;
        this.y *= v.y;
    }

    divide(v) {
        this.x /= v.x;
        this.y /= v.y;
    }

    magnitude() {
        return Math.sqrt(
            this.x * this.x +
            this.y * this.y
        );
    }

    direction() {
        return Math.atan2(this.y, this.x);
    }

    normalized() {
        var magnitude = this.magnitude();
        return new Vector(this.x / magnitude, this.y / magnitude);
    }

    negative() {
        return new Vector(-this.x, -this.y);
    }
}