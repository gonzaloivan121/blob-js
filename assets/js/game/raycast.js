class Raycast {
    /**
     * 
     * @param {Vector} from 
     * @param {Vector} to 
     * @param {number} distance 
     */
    static fire(from, to, distance) {
        const direction = Vector.subtract(from, to).normalized().negative();
        const direction_distance = Vector.multiply(direction, new Vector(distance, distance));

        return Vector.sum(from, direction_distance);
    }
}