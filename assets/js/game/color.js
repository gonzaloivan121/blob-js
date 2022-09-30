class Color {
    /**
     * 
     * @param { number } r - Red amount from 0 to 255
     * @param { number } g - Green amount from 0 to 255
     * @param { number } b - Blue amount from 0 to 255
     * @returns { string } The RGB string
     */
    static get_rgb_string(r, g, b) {
        if (r < 0) r = 0;
        if (r > 255) r = 255;
        if (g < 0) g = 0;
        if (g > 255) g = 255;
        if (b < 0) b = 0;
        if (b > 255) b = 255;
        return "rgb(" + r + ", " + g + ", " + b + ")";
    }

    /**
     * 
     * @param { number } r - Red amount from 0 to 255
     * @param { number } g - Green amount from 0 to 255
     * @param { number } b - Blue amount from 0 to 255
     * @returns {{ r: number, g: number, b: number }} The RGB string
     */
    static get_rgb(r, g, b) {
        if (r < 0) r = 0;
        if (r > 255) r = 255;
        if (g < 0) g = 0;
        if (g > 255) g = 255;
        if (b < 0) b = 0;
        if (b > 255) b = 255;
        return {
            r: r,
            g: g,
            b: b
        }
    }

    static rgb_from_name(color) {
        var rgb = null;

        switch(color) {
            case "red":
                rgb = this.get_rgb(255, 0, 0);
                break;
            case "green":
                rgb = this.get_rgb(0, 255, 0);
                break;
            case "blue":
                rgb = this.get_rgb(0, 0, 255);
                break;
            case "blue":
                rgb = this.get_rgb(0, 0, 255);
                break;
            case "yellow":
                rgb = this.get_rgb(255, 255, 0);
                break;
            case "purple":
                rgb = this.get_rgb(128, 0, 128);
                break;
            case "black":
                rgb = this.get_rgb(0, 0, 0);
                break;
            case "white":
                rgb = this.get_rgb(255, 255, 255);
                break;
        }

        var rgb_string = this.get_rgb_string(rgb.r, rgb.g, rgb.b);

        return { rgb: rgb, string: rgb_string };
    }

    static hex_to_rgb(hex) {
        return {
            r: parseInt(hex.substr(1, 2), 16),
            g: parseInt(hex.substr(3, 2), 16),
            b: parseInt(hex.substr(5, 2), 16)
        };
    }
}