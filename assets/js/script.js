const canvas = document.getElementById('canvas');
const context = canvas.getContext("2d");
var canvas_width = canvas.clientWidth;
var canvas_height = canvas.clientHeight;

function resize() {
    canvas_width = canvas.width = window.innerWidth - window.innerWidth * 0.20;
    canvas_height = canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

load_info();
load_skins();
show_login_modal();

var game = new Game(60);

function start_game() {
    if (!game.started) {
        const start_game_button = document.getElementById("start-game");
        const player_name_input = document.getElementById("playername");
        const player_color_input = document.getElementById("playercolor");
        const player_skin_input = document.getElementById("skin-image");

        const player_info = get_new_player_info(player_name_input, player_color_input, player_skin_input);

        if (!player_info) return;

        if (game.start_game(player_info.name, player_info.color, player_info.skin)) {
            hide_login_modal();
            toggle_pannel();
            start_game_button.innerHTML = "Leave Game";
            start_game_button.onclick = show_leave_game_confirmation;
        }

        player_name_input.oninput = (e) => {
            const new_name = e.target.value;
            if (new_name.length < 1) return;
            game.player.name = new_name;
        }

        player_color_input.oninput = (e) => {
            const new_color = Color.hex_to_rgb(e.target.value);
            game.player.set_color(new_color);
        }
    }
}

function get_new_player_info(name_input, color_input, skin_input) {
    if (!name_input.checkValidity()) {
        name_input.reportValidity();
        createToast('Player name cannot be empty!', TOAST_TYPE.WARNING);
        return false;
    }

    return {
        name: name_input.value,
        color: Color.hex_to_rgb(color_input.value),
        skin: skin_input.src
    }
}

function show_leave_game_confirmation() {
    show_confirmation_dialbox(
        "Do you really wanna leave the game?",
        "Yes",
        "No",
        leave_game
    )
}

function leave_game() {
    if (game.started) {
        const start_game_button = document.getElementById("start-game");
        game.leave_game();
        hide_confirmation_dialbox();
        setTimeout(() => {
            show_confirmation_dialbox(
                "Do you want to look at other players or close this window?",
                "Keep looking",
                "Close it",
                hide_confirmation_dialbox,
                window.close
            )
        }, 500);
        start_game_button.style.display = "none";
    }
}

function load_info() {
    Utilities.load_json('assets/json/info/info.json', (response) => {
        var info = null;

        try {
            info = JSON.parse(response);
        } catch (error) {
            createToast('No se ha podido obtener la información sobre las redes sociales', TOAST_TYPE.ERROR);
        }

        if (info !== null) {
            generate_info_modal(info);
        }
    }, (error) => {
        createToast(error, TOAST_TYPE.ERROR);
    });
}

function load_skins() {
    Utilities.load_json('assets/json/skins/skins.json', (response) => {
        var skins = null;

        try {
            skins = JSON.parse(response);
        } catch (error) {
            createToast('No se han podido obtener las skins', TOAST_TYPE.ERROR);
        }

        if (skins !== null) {
            generate_skins_dropdown(skins);
        }
    }, (error) => {
        createToast(error, TOAST_TYPE.ERROR);
    });
}

/**
 * 
 * @param {{description: string, socials: {name: string, icon: string, url: string}[]}} info 
 * @returns 
 */
function generate_info_modal(info = null) {
    if (info === null) return;

    var info_description_element = document.getElementById("info-description");
    var info_buttons_element = document.getElementById("info-buttons");

    info_description_element.innerText = info.description;

    info.socials.forEach(social => {
        const button = document.createElement('button');
        const img = document.createElement('img');

        img.src = social.icon;
        img.height = "25";

        button.classList.add('button');
        button.classList.add('box-shadow');

        if (social.url) {
            button.onclick = () => {
                window.open(social.url, '_blank').focus();
            }
        } else {
            const share_data = {
                title: 'Blob JS',
                text: social.share_text,
                url: window.location.href
            };
            button.onclick = () => {
                navigator.share(share_data);
            }
        }

        button.innerText = social.name;
        button.prepend(img);

        info_buttons_element.appendChild(button);
    });
}

/**
 * 
 * @param {{name: string, icon: string}[]} skins 
 */
function generate_skins_dropdown(skins = null) {
    if (skins === null) return;

    const skins_container = document.getElementById("skins-container");

    skins.forEach(skin => {
        const option = document.createElement("div");
        const img = document.createElement("img");
        const name = document.createElement("div");

        option.classList.add("dropdown-option");
        img.classList.add("skin-image");
        name.classList.add("skin-name");

        img.src = skin.icon;
        name.innerHTML = skin.name;

        option.onclick = () => {
            set_skin(skin);
        }

        option.prepend(name);
        option.prepend(img);

        skins_container.appendChild(option);
    });
}

function set_skin(skin) {
    const skin_image = document.getElementById("skin-image");
    const skin_name = document.getElementById("skin-name");
    const reset_skin_button = document.getElementById("reset-skin");

    skin_image.src = skin.icon;
    skin_name.innerHTML = skin.name;

    reset_skin_button.classList.add("active");

    if (game.started) {
        game.set_player_skin(skin_image.src);
    }
}

function reset_skin() {
    const skin_image = document.getElementById("skin-image");
    const skin_name = document.getElementById("skin-name");
    const reset_skin_button = document.getElementById("reset-skin");

    skin_image.src = "";
    skin_name.innerHTML = "";

    reset_skin_button.classList.remove("active");

    if (game.started) {
        game.set_player_skin(null);
    }
}

canvas.onmousemove = e => {
    if (Input.mouse.left.down) {
        const rect = canvas.getBoundingClientRect(),
            screen_x = Math.floor(e.clientX - rect.left),
            screen_y = Math.floor(e.clientY - rect.top);
        
        const position = new Vector(screen_x, screen_y);

        if (game.player !== null) {
            const direction = Vector.subtract(game.player.position, position).normalized().negative();
            game.set_player_direction(direction);
        }
    }
};

canvas.onmousedown = e => {
    switch (e.button) {
        case 0:
            Input.mouse.left.down = true;
            break;
        case 1:
            Input.mouse.middle.down = true;
            break;
        case 2:
            Input.mouse.right.down = true;
            break;
    }
}

canvas.onmouseup = e => {
    switch (e.button) {
        case 0:
            Input.mouse.left.down = false;
            break;
        case 1:
            Input.mouse.middle.down = false;
            break;
        case 2:
            Input.mouse.right.down = false;
            break;
    }
}

canvas.oncontextmenu = e => {
    e.preventDefault();
    e.stopPropagation();
}

function show_confirmation_dialbox(
    title = "Do you want to confirm this?",
    confirm_text = "Yes",
    decline_text = "No",
    confirm_action = () => { },
    decline_action = hide_confirmation_dialbox
) {
    var confirmation_dialbox = document.getElementById("confirmation-dialbox");
    var confirmation_confirm = document.getElementById("confirmation-confirm");
    var confirmation_decline = document.getElementById("confirmation-decline");
    var confirmation_title = document.getElementById("confirmation-title");
    var content = document.getElementById("content");

    content.classList.add("blur");
    confirmation_dialbox.classList.add("active");
    confirmation_title.innerHTML = title;
    confirmation_confirm.innerText = confirm_text;
    confirmation_decline.innerText = decline_text;

    confirmation_confirm.onclick = confirm_action;
    confirmation_decline.onclick = decline_action;
}

function hide_confirmation_dialbox() {
    var confirmation_dialbox = document.getElementById("confirmation-dialbox");
    var confirmation_confirm = document.getElementById("confirmation-confirm");
    var confirmation_decline = document.getElementById("confirmation-decline");
    var confirmation_title = document.getElementById("confirmation-title");
    var content = document.getElementById("content");

    content.classList.remove("blur");
    confirmation_dialbox.classList.remove("active");

    setTimeout(() => {
        confirmation_title.innerText = "";
        confirmation_confirm.innerText = "";
        confirmation_decline.innerText = "";
        confirmation_confirm.onclick = null;
    }, 500);
}

function show_info_modal() {
    var info_modal = document.getElementById("info-modal");
    var content = document.getElementById("content");
    info_modal.classList.add("active");
    content.classList.add("blur");
}

function hide_info_modal() {
    var info_modal = document.getElementById("info-modal");
    var content = document.getElementById("content");
    info_modal.classList.remove("active");
    content.classList.remove("blur");
}

function show_login_modal() {
    var login_modal = document.getElementById("login-modal");
    login_modal.classList.add("active");
}

function hide_login_modal() {
    var login_modal = document.getElementById("login-modal");
    login_modal.classList.remove("active");
}

function show_save_confirmation() {
    show_confirmation_dialbox(
        'Do you want to save these settings?',
        'Yes, save them!',
        'No, I don\'t think I will...',
        () => {
            save_settings();
            hide_confirmation_dialbox();
        },
        () => {
            createToast('Settings not saved', TOAST_TYPE.WARNING);
            hide_confirmation_dialbox();
        }
    );
}

function toggle_pannel() {
    var pannel = document.getElementById("pannel");
    if (pannel.classList.contains("active")) {
        pannel.classList.remove("active");
    } else {
        pannel.classList.add("active");
    }
}