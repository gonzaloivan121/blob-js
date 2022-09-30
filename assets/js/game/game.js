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
     * Create Particles, Entities and the Player.
     * Start interval for the first time
     */
    start_game(player_name = null, player_color = null, player_skin = "") {
        if (player_name === null || player_color === null) return;

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
            this.spawn_random_particle();
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
                this.player_ref.set(this.player);
                this.generate_player_board(this.player);

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
            const entity = entities_snapshot[id];
            this.update_player_board(entity);

            if (this.player !== null && entity.id === this.player.id) return;

            var found_entity = this.entities.find((e) => {
                return e.id === id;
            });

            const entity_data = this.generate_entity_data(entity);

            if (!found_entity) {
                this.create_entity(entity_data);
                return;
            }

            found_entity.id = entity_data.id;
            found_entity.position = entity_data.position;
            found_entity.direction = entity_data.direction;
            found_entity.velocity = entity_data.velocity;
            found_entity.color_rgb = entity_data.color_rgb;
            found_entity.name = entity_data.name;
            found_entity.border_color = entity_data.border_color;
            found_entity.color = entity_data.color;
            found_entity.radius = entity_data.radius;
            found_entity.skin = entity_data.skin;
            found_entity.points = entity_data.points;
            found_entity.is_alive = entity_data.is_alive;
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
            const particle = particles_snapshot[id];

            var found_particle = this.particles.find((p) => {
                return p.id === id;
            });

            const particle_data = this.generate_particle_data(particle);

            if (!found_particle) {
                this.create_particle_from(particle_data);
                return;
            };

            found_particle.id = particle_data.id;
            found_particle.position = particle_data.position;
            found_particle.color = particle_data.color;
            found_particle.radius = particle_data.radius;
            found_particle.points = particle_data.points;
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
        const entity_data = this.generate_entity_data(added_player);
        this.create_entity(entity_data);
        this.generate_player_board(added_player);
    }

    /**
     * Fires whenever a new Particle is added
     * 
     * @param { firebase.database.DataSnapshot } snapshot 
     */
    handle_new_particle(snapshot) {
        const added_particle = snapshot.val();

        const found_particle = this.particles.find((p) => {
            return p.id === added_particle.id;
        });

        if (found_particle) return;
        const particle_data = this.generate_particle_data(added_particle);
        this.create_particle_from(particle_data);
    }

    generate_entity_data(entity) {
        return {
            id: entity.id,
            name: entity.name,
            position: new Vector(
                entity.position.x,
                entity.position.y
            ),
            direction: new Vector(
                entity.direction.x,
                entity.direction.y
            ),
            velocity: new Vector(
                entity.velocity.x,
                entity.velocity.y
            ),
            color: entity.color,
            color_rgb: entity.color_rgb,
            border_color: entity.border_color,
            radius: entity.radius,
            skin: entity.skin,
            points: entity.points,
            is_alive: entity.is_alive
        }
    }

    generate_particle_data(particle) {
        return {
            id: particle.id,
            position: new Vector(
                particle.position.x,
                particle.position.y
            ),
            color: particle.color,
            radius: particle.radius,
            points: particle.points
        }
    }

    /**
     * Fires whenever a Player leaves
     * 
     * @param { firebase.database.DataSnapshot } snapshot 
     */
    handle_player_removed(snapshot) {
        const id = snapshot.val().id;

        if (this.player.id === id) {
            this.player = null;
            this.remove_player_board(id);
            return;
        }

        const i = this.entities.findIndex(e => {
            return e.id === id;
        });

        this.entities.splice(i, 1);
        this.remove_player_board(id);
    }

    /**
     * Fires whenever a Particle is removed
     * 
     * @param { firebase.database.DataSnapshot } snapshot 
     */
    handle_particle_removed(snapshot) {
        const id = snapshot.val().id;
        
        const i = this.particles.findIndex(p => {
            return p.id === id;
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
        entity.is_alive = entity_data.is_alive;

        this.entities.push(entity);
    }

    create_particles(amount) {
        for (let i = 0; i < amount; i++) {
            this.create_particle();
        }
    }

    create_particle() {
        const particle = new Particle();
        const particle_ref = firebase.database().ref('particles/' + particle.id);
        particle_ref.set(particle);
        this.particles.push(particle);
    }

    create_particle_from(particle_data) {
        var particle = new Particle();
        
        particle.id = particle_data.id;
        particle.position = particle_data.position;
        particle.color = particle_data.color;
        particle.radius = particle_data.radius;
        particle.points = particle_data.points;

        this.particles.push(particle);
    }

    generate_player_board(player) {
        const player_boards = document.getElementById("player-boards");

        const board = document.createElement("div");
        const circle = document.createElement("div");
        const skin = document.createElement("img");
        const name = document.createElement("div");
        const points = document.createElement("div");

        board.classList.add("player-board");
        board.classList.add("drop-shadow");
        board.id = player.id;

        circle.classList.add("circle");
        skin.classList.add("player-skin");
        name.classList.add("player-name");
        points.classList.add("player-points");

        circle.style.borderColor = player.border_color;
        circle.style.backgroundColor = player.color;
        skin.src = player.skin;

        if (player.skin === "") {
            skin.style.visibility = "hidden";
        }
        
        name.innerHTML = player.name;
        points.innerHTML = player.points;

        circle.prepend(skin);

        board.prepend(points);
        board.prepend(name);
        board.prepend(circle);

        player_boards.appendChild(board);
    }

    update_player_board(player) {
        const board = document.getElementById(player.id);
        const circle = board.querySelector(".circle");
        const skin = circle.querySelector(".player-skin");
        const name = board.querySelector(".player-name");
        const points = board.querySelector(".player-points");

        if (circle.style.borderColor !== player.border_color) {
            circle.style.borderColor = player.border_color;
        }

        if (circle.style.backgroundColor !== player.color) {
            circle.style.backgroundColor = player.color;
        }

        if (skin.src !== player.skin) {
            skin.src = player.skin;
            if (player.skin !== "") {
                skin.style.visibility = "visible";
            } else {
                skin.style.visibility = "hidden";
            }
        }

        if (name.innerHTML !== player.name) {
            name.innerHTML = player.name;
        }

        if (points.innerHTML !== player.points.toString()) {
            points.innerHTML = player.points;
            board.style.order = -player.points;
        }
    }

    remove_player_board(id) {
        const board = document.getElementById(id);
        board.remove();
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

            if (this.player !== null && this.player.is_alive) {
                if (this.player_ref !== undefined) {
                    this.player_ref.set(this.player);
                }
                this.player.update();
                this.player.check_collision(
                    this.particles.length > 0 ? this.particles : null,
                    this.entities.length > 0 ? this.entities : null
                );
            }
        }, time);

        if (this.IntervalID !== undefined) {
            this.started = true;
        }
    }

    spawn_random_particle() {
        const time = Utilities.random(1, 50) * 100;

        setTimeout(() => {
            this.create_particle();
            this.spawn_random_particle();
        }, time);
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