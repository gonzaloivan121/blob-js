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
    start_game(player_name = null, player_color = null, player_skin) {
        if (player_name === null || player_color === null) return;
        if (player_skin.length === 0) player_skin = null;

        this.player = this.create_player(player_name, player_color, player_skin);
        
        var started = false;
        
        if (this.IntervalID === undefined) {
            this.start_interval(this.Interval);
        }
        
        if (this.IntervalID !== undefined) {
            started = true;
            this.login();
            this.listen_to_firebase();
            this.generate_particles();
        }

        return started;
    }

    leave_game() {
        if (this.player !== null && this.started) {
            firebase.database().ref('players/' + this.player.id).remove();
            this.player = null;
        }
    }

    generate_particles() {
        firebase.database().ref('particles').once('value').then(snapshot => {
            if (snapshot.numChildren() === 0) {
                this.create_particles(100);
            }
        });
    }

    /**
     * Create a login authentication anonymously
     */
    login() {
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                this.player.id = user.uid;
                this.player_ref = firebase.database().ref('players/' + this.player.id);

                this.player_ref.set({
                    id: this.player.id,
                    name: this.player.name,
                    position: this.player.position,
                    direction: this.player.direction,
                    velocity: this.player.velocity,
                    color: this.player.color,
                    border_color: this.player.border_color,
                    color_rgb: this.player.color_rgb,
                    radius: this.player.radius,
                    points: this.player.points,
                    skin: this.player.skin
                });

                // Remove me from firebase when I disconnect
                this.player_ref.onDisconnect().remove(onComplete => {
                    if (onComplete === null) { // Removed successfully
                        firebase.database().ref('players').once('value').then(snapshot => {
                            if (snapshot.numChildren() < 1) {
                                firebase.database().ref('particles').remove();
                            }
                        });
                    }
                });
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
            this.handle_player_removed(snapshot);
        });

        all_particles_ref.on("value", snapshot => {
            this.handle_all_particles(snapshot);
        });

        all_particles_ref.on("child_added", snapshot => {
            this.handle_new_particle(snapshot);
        });

        all_particles_ref.on("child_removed", snapshot => {
            this.handle_particle_removed(snapshot);
        });
    }

    /**
     * Fires whenever a change occurs on a Player
     * 
     * @param { firebase.database.DataSnapshot } snapshot 
     */
    handle_all_players(snapshot) {
        const entities_snapshot = snapshot.val();
        if (entities_snapshot === null) return;
        Object.keys(entities_snapshot).forEach(id => {
            var entity = entities_snapshot[id];
            if (entity.id === this.player.id) return;

            var found_entity = this.entities.find((e) => {
                return e.id === entity.id;
            });

            if (!found_entity) {
                this.create_entity({
                    id: entity.id,
                    name: entity.name,
                    position: new Vector(
                        entity.position.x,
                        entity.position.y
                    ),
                    color_rgb: entity.color_rgb,
                    radius: entity.radius,
                    skin: entity.skin,
                    direction: new Vector(
                        entity.direction.x,
                        entity.direction.y
                    ),
                    velocity: new Vector(
                        entity.velocity.x,
                        entity.velocity.y
                    ),
                    points: entity.points
                });
            } else {
                found_entity.position = new Vector(
                    entity.position.x,
                    entity.position.y
                );

                found_entity.direction = new Vector(
                    entity.direction.x,
                    entity.direction.y
                );

                found_entity.velocity = new Vector(
                    entity.velocity.x,
                    entity.velocity.y
                );
    
                found_entity.radius = entity.radius;
                found_entity.skin = entity.skin;
                found_entity.points = entity.points;
                found_entity.is_alive = entity.is_alive;
            }

        });
    }

    /**
     * Fires whenever a change occurs on a Particle
     * 
     * @param { firebase.database.DataSnapshot } snapshot 
     */
    handle_all_particles(snapshot) {
        const particles_snapshot = snapshot.val();
        if (particles_snapshot === null) return;
        Object.keys(particles_snapshot).forEach(id => {
            
            var particle = particles_snapshot[id];

            var found_particle = this.particles.find((p) => {
                return  p.position.x === particle.position.x &&
                        p.position.y === particle.position.y;
            });

            if (!found_particle) return;

            found_particle.position = new Vector(
                particle.position.x,
                particle.position.y
            );

            found_particle.points = particle.points;
        });
    }

    /**
     * Create a new Player
     * 
     * @param { string } name - The name of the Player
     * @param { string } color - The color of the Player
     * @returns { Player } The generated Player
     */
    create_player(name = "Player", color, skin) {
        return new Player(name, new Vector(
            Utilities.random(50, canvas_width - 50),
            Utilities.random(50, canvas_height - 50)
        ), color, 6, skin);
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
            color_rgb: added_player.color_rgb,
            radius: added_player.radius,
            skin: added_player.skin,
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
     * Fires whenever a new Particle is added
     * 
     * @param { firebase.database.DataSnapshot } snapshot 
     */
    handle_new_particle(snapshot) {
        const added_particle = snapshot.val();

        var found_particle = this.particles.find((p) => {
            return  p.position.x === added_particle.position.x &&
                    p.position.y === added_particle.position.y;
        });

        if (found_particle) return;

        this.create_particle_from({
            position: new Vector(
                added_particle.position.x,
                added_particle.position.y
            ),
            color: added_particle.color,
            radius: added_particle.radius,
            points: added_particle.points
        });
    }

    /**
     * Fires whenever a Player leaves
     * 
     * @param { firebase.database.DataSnapshot } snapshot 
     */
    handle_player_removed(snapshot) {
        const id = snapshot.val().id;

        const i = this.entities.findIndex(e => {
            return e.id === id;
        });

        this.entities.splice(i, 1);
    }

    /**
     * Fires whenever a Particle is removed
     * 
     * @param { firebase.database.DataSnapshot } snapshot 
     */
    handle_particle_removed(snapshot) {
        const particle = snapshot.val();
        
        const i = this.particles.findIndex(p => {
            return  p.position.x === particle.position.x &&
                    p.position.y === particle.position.y;
        });

        this.particles.splice(i, 1);
    }

    create_entity(entity_data) {
        var entity = new Entity(
            entity_data.name,
            entity_data.position,
            entity_data.color_rgb,
            entity_data.radius
        );

        entity.id = entity_data.id;
        entity.direction = entity_data.direction;
        entity.velocity = entity_data.velocity;
        entity.points = entity_data.points;

        this.entities.push(entity);
    }

    create_particles(amount) {
        for (let i = 0; i < amount; i++) {
            var particle = this.create_particle(
                Color.get_rgb_string(
                    Utilities.random(0, 255),
                    Utilities.random(0, 255),
                    Utilities.random(0, 255)
                )
            );
            this.particles.push(particle);
        }
    }

    create_particle(color) {
        var particle = new Particle(new Vector(
            Utilities.random(50, canvas_width - 50),
            Utilities.random(50, canvas_height - 50)
        ), color);

        const particle_ref = firebase.database().ref('particles/' + particle.position.x + 'x' + particle.position.y);
        
        particle_ref.set({
            position: particle.position,
            color: particle.color,
            radius: particle.radius,
            points: particle.points
        });

        return particle;
    }

    create_particle_from(particle_data) {
        var particle = new Particle(
            particle_data.position,
            particle_data.color,
            particle_data.radius
        );

        particle.points = particle_data.points;

        this.particles.push(particle);
    }

    /**
     * Set the direction of the Player
     * 
     * @param { Vector } direction - The new direction Vector of the Player
     */
    set_player_direction(direction) {
        this.player.set_direction(direction);
    }

    set_player_skin(skin) {
        this.player.skin = skin;
    }
    
    set_player_name(name) {
        this.player.name = name;
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

                if (this.player_ref !== undefined) {
                    this.player_ref.set(this.player);
                }
            }
        }, time);

        if (this.IntervalID !== undefined) {
            this.started = true;
        }
    }

    draw_background() {
        context.fillStyle = "#f3faff";
        context.fillRect(0, 0, canvas_width, canvas_height);

        context.beginPath();
        context.strokeStyle = "#eaf1f5";
        context.lineWidth = 2;

        const grid_size = 75;

        for (let x = canvas_width / grid_size; x < canvas_width; x += canvas_width / grid_size) {
            context.moveTo(x, 0);
            context.lineTo(x, canvas_height);
        }

        for (let y = canvas_height / grid_size; y < canvas_height; y += canvas_width / grid_size) {
            context.moveTo(0, y);
            context.lineTo(canvas_width, y);
        }

        context.stroke();
    }
}