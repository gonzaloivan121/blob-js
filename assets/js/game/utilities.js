/**
 * Some useful utilities
 */
class Utilities {
    /**
     * Generates a random integer from a given minimum and maximum. Both included.
     * 
     * @param {Number} min - The minimum generated number
     * @param {Number} max - The maximum generated number
     * @returns {Number} The randomly generated integer
     */
    static random(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    /**
     * Maps a number from a range to another given range
     * 
     * @param {Number} n - The number to be mapped
     * @param {Number} min1 - The number's original minimum range
     * @param {Number} max1 - The number's original maximum range
     * @param {Number} min2 - The number's mapped minimum range
     * @param {Number} max2 - The number's mapped maximum range
     * @returns {Number} The mapped number
     */
    static map(n, min1, max1, min2, max2) {
        return min2 + (max2 - min2) * ((n - min1) / (max1 - min1));
    }

    /**
     * Loads a JSON file from a given path. It can be an URL or a filesystem path
     * 
     * @param {String} path - The path of the json to be loaded
     * @param {Function} callback - The function to be called once the JSON is loaded
     * @param {Function} callback_error - The function to be called if the load fails
     */
    static load_json(path = null, callback = () => {}, callback_error = () => {}) {
        if (path === null) return;

        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open('GET', path, true);
        xobj.onreadystatechange = function () {
            if (xobj.readyState == 4 && xobj.status == "200") {
                // .open will NOT return a value but simply returns undefined in async mode so use a callback
                callback(xobj.responseText);
            }
        }
        xobj.onerror = function () {
            callback_error("Ha ocurrido un error.");
        }
        xobj.send(null);
    }

    /**
     * Downloads a JSON file with a given name.
     * 
     * @param {object} data - The data that will be saved
     * @param {String} filename - The name of the file
     */
    static download_json(data = null, filename = Date.now()) {
        if (data === null) return false;

        try {
            data = JSON.stringify(data);
        } catch (error) {
            createToast('There has been an error saving the settings', TOAST_TYPE.ERROR);
            return false;
        }

        var link = document.createElement("a");
        var file = new Blob([data], {type: 'application/json'});
        link.href = URL.createObjectURL(file);
        link.download = filename + '.json';
        link.click();

        return true;
    }

    /**
     * Uploads a JSON file.
     * 
     * @param {object} data - The data that will be saved
     * @param {String} filename - The name of the file
     */
    static upload_json(file = null, callback = () => {}) {
        if (file === null) return;

        file.text().then((res) => {
            callback(res);
        })
    }

    /**
     * Returns the environment that the game is running on
     * 
     * @returns {String} The game environment
     */
    static get_environment() {
        if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
            return 'local';
        }

        if (window.location.hostname.includes("dev-")) {
            return 'development';
        }

        if (window.location.hostname.includes("uat-")) {
            return 'testing';
        }

        return 'production';
    }

    /**
     * Returns the capitalized string inputed
     * 
     * @param {String} string - The inout string to be capitalized
     * @returns {String} The capitalized string
     */
    static capitalize(string) {
        string = string.toLocaleLowerCase();
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    static lerp(start, end, amt) {
        return (1 - amt) * start + amt * end;
    }
}