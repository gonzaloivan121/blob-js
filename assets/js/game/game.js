class Game {
    /**
     * Has the game started?
     * 
     * @type { boolean }
     * @public
     */
    started = false;
    /**
     * Particle array
     * @type { Particle[] }
     * @public
     */
    particles = [];
    /**
     * Entity array
     * @type { Entity[] }
     * @public
     */
    entities = [];
    /**
     * Obstacle array
     * @type { Obstacle[] }
     * @public
     */
    obstacles = [];
    /**
     * @param { Player | null }
     */
    player = null;

    /**
     * Create a new Game instance
     * 
     * @param { number } ticks - Number of ticks per second
     */
    constructor(ticks) {
        this.ticks = ticks;
        this.Interval = 1000 / this.ticks;
        this.IntervalID = undefined;
    }

    /**
     * Update and reset the Interval
     */
    update_interval() {
        this.Interval = 1000 / this.ticks;
        this.reset_interval();
    }
    
    /**
     * Reset the Interval
     */
    reset_interval() {
        clearInterval(this.IntervalID);
        this.start_interval(this.Interval);
    }

    /**
     * Set all Particle positions to a random Vector
     */
    random_start() {
        this.particles.forEach(particle => {
            const position = new Vector(
                Utilities.random(50, canvas_width - 50),
                Utilities.random(50, canvas_height - 50)
            );
            particle.position = position;
        });
    }

    /**
     * Update the tick count and reset the interval
     * 
     * @param { number } ticks 
     */
    update_ticks(ticks) {
        this.ticks = ticks;
        this.update_interval();
    }

    /**
     * Create Particles, Entities and the Player.
     * Start interval for the first time
     */
    start_game(player_name = null) {
        if (player_name === null) return;
        this.create_particles(100, "blue");
        this.create_particles(100, "white");
        this.create_particles(100, "yellow");

        this.player = this.create_player(player_name, "green");

        var started = false;
        
        if (this.IntervalID === undefined) {
            this.start_interval(this.Interval);
        }

        if (this.IntervalID !== undefined) {
            started = true;
            this.login();
            this.listen_to_firebase();
        }

        return started;
    }

    /**
     * Create a login authentication anonymously
     */
    login() {
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                this.player.id = user.uid;
                this.playerRef = firebase.database().ref('players/' + this.player.id);

                this.playerRef.set({
                    id: this.player.id,
                    name: this.player.name,
                    position: this.player.position,
                    direction: this.player.direction,
                    velocity: this.player.velocity,
                    color: this.player.color,
                    radius: this.player.radius,
                    points: this.player.points
                });

                // Remove me from firebase when I disconnect
                this.playerRef.onDisconnect().remove();
            } else {
                // Logged out
            }
        });

        firebase.auth().signInAnonymously().catch(error => {
            const code = error.code;
            const message = error.message;

            createToast('Error ' + code + ': ' + message, TOAST_TYPE.ERROR);
        });
    }

    listen_to_firebase() {
        const all_players_ref = firebase.database().ref('players');
        const all_particles_ref = firebase.database().ref('particles');

        all_players_ref.on("value", snapshot => {
            this.handle_all_players(snapshot);
        });

        all_players_ref.on("child_added", snapshot => {
            this.handle_new_player(snapshot);
        });

        all_players_ref.on("child_removed", snapshot => {
            this.handle_player_left(snapshot);
        });
    }

    /**
     * Fires whenever a change occurs on a Player
     * 
     * @param { firebase.database.DataSnapshot } snapshot 
     */
    handle_all_players(snapshot) {
        const entities_snapshot = snapshot.val();
        Object.keys(entities_snapshot).forEach(id => {
            var entity = entities_snapshot[id];
            if (entity.id === this.player.id) return;

            var found_entity = this.entities.find((e) => {
                return e.id === entity.id;
            });

            found_entity.position = new Vector(
                entity.position.x,
                entity.position.y
            );

            found_entity.radius = entity.radius;
            found_entity.points = entity.points;
            found_entity.is_alive = entity.is_alive;
        });
    }

    /**
     * Create a new Player
     * 
     * @param { string } name - The name of the Player
     * @param { string } color - The color of the Player
     * @returns { Player } The generated Player
     */
    create_player(name = "Player", color) {
        return new Player(name, new Vector(
            Utilities.random(50, canvas_width - 50),
            Utilities.random(50, canvas_height - 50)
        ), color);
    }

    /**
     * Fires whenever a new Player is added
     * 
     * @param { firebase.database.DataSnapshot } snapshot 
     */
    handle_new_player(snapshot) {
        const added_player = snapshot.val();

        if (added_player.id === this.player.id) return;

        this.create_entity({
            id: added_player.id,
            name: added_player.name,
            position: new Vector(
                added_player.position.x,
                added_player.position.y
            ),
            color: added_player.color,
            radius: added_player.radius,
            direction: new Vector(
                added_player.direction.x,
                added_player.direction.y
            ),
            velocity: new Vector(
                added_player.velocity.x,
                added_player.velocity.y
            ),
            points: added_player.points
        });
    }

    /**
     * Fires whenever a Player leaves
     * 
     * @param { firebase.database.DataSnapshot } snapshot 
     */
    handle_player_left(snapshot) {
        const removed_id = snapshot.val().id;

        const i = this.entities.findIndex(e => {
            return e.id === removed_id;
        });

        this.entities.splice(i, 1);
    }

    create_entity(entity_data) {
        var entity = new Entity(
            entity_data.name,
            entity_data.position,
            entity_data.color,
            entity_data.radius
        );

        entity.id = entity_data.id;
        entity.direction = entity_data.direction;
        entity.velocity = entity_data.velocity;
        entity.points = entity_data.points;

        this.entities.push(entity);
    }

    create_particles(amount, color) {
        for (let i = 0; i < amount; i++) {
            var particle = this.create_particle(color);
            this.particles.push(particle);
        }
    }

    create_particle(color) {
        return new Particle(new Vector(
            Utilities.random(50, canvas_width - 50),
            Utilities.random(50, canvas_height - 50)
        ), color);
    }

    /**
     * Set the direction of the Player
     * 
     * @param { Vector } direction - The new direction Vector of the Player
     */
    set_player_direction(direction) {
        this.player.set_direction(direction);
    }

    start_interval(time) {
        this.IntervalID = setInterval(() => {
            this.draw_background();

            // Game logic goes here
            if (this.particles.length > 0) {
                this.particles.forEach(particle => {
                    particle.update();
                });
            }

            if (this.entities.length > 0) {
                this.entities.forEach(entity => {
                    entity.update();
                });
            }

            if (this.player !== null) {
                this.player.update();
                this.player.check_collision(
                    this.particles.length > 0 ? this.particles : null,
                    this.entities.length > 0 ? this.entities : null
                );

                if (this.playerRef !== undefined) {
                    this.playerRef.set(this.player);
                }
            }
        }, time);

        if (this.IntervalID !== undefined) {
            this.started = true;
        }
    }

    draw_background() {
        const gradient = context.createLinearGradient(0, 0, 0, canvas_height);
        gradient.addColorStop(0, "black");
        gradient.addColorStop(1, "black");
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas_width, canvas_height);
    }
}