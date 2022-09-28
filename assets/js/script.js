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

var game = new Game(60);

function start_game() {
    if (!game.started) {
        const player_name_input = document.getElementById("playername");
        const player_name = player_name_input.value;

        if (!player_name_input.checkValidity()) {
            player_name_input.reportValidity();
            createToast('Player name cannot be empty!', TOAST_TYPE.WARNING);
            return;
        }

        if (game.start_game(player_name)) {
            player_name_input.disabled = true;
        }
    }
}

function load_info() {
    Utilities.load_json('assets/json/info/info.json', (response) => {
        var info = null;

        try {
            info = JSON.parse(response);
        } catch (error) {
            createToast('No se ha podido obtener la información sobre las redes sociales', 'error');
        }

        if (info !== null) {
            generate_info_modal(info);
        }
    }, (error) => {
        createToast(error, TOAST_TYPE.ERROR);
    });
}

/**
 * 
 * @param {{description: string, socials: [{name: string, icon: string, url: string}]}} info 
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
                title: 'Life JS',
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

function show_upload_modal() {
    var upload_modal = document.getElementById("upload-modal");
    var content = document.getElementById("content");
    upload_modal.classList.add("active");
    content.classList.add("blur");
}

function hide_upload_modal() {
    var upload_modal = document.getElementById("upload-modal");
    var content = document.getElementById("content");
    upload_modal.classList.remove("active");
    content.classList.remove("blur");
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

function toogle_pannel() {
    var pannel = document.getElementById("pannel");
    if (pannel.classList.contains("active")) {
        pannel.classList.remove("active");
    } else {
        pannel.classList.add("active");
    }
}