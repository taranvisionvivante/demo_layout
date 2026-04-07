
import greenHseSmallLogo from "../../assets/img/greenhse-logo-small.png"


// Function to load SVG, convert to PNG using Canvas, and return a data URL
export const convertSVGToPNG = async (svgPath) => {
    return new Promise((resolve, reject) => {
        fetch(svgPath)
            .then(response => response.text())
            .then(svgText => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const img = new Image();
                const svgBlob = new Blob([svgText], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(svgBlob);
                console.log(" load comman hepler function");


                img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    URL.revokeObjectURL(url);
                    resolve(canvas.toDataURL('image/png'));
                };

                img.onerror = (err) => reject(err);

                img.src = url;
            })
            .catch(err => reject(err));
    });
};

// Function to load the logo
export const loadLogo = async () => {
    return new Promise((resolve, reject) => {
        const logo = new Image();
        logo.src = greenHseSmallLogo; // Update the path to your logo
        logo.onload = () => resolve(logo);
        logo.onerror = (err) => reject(err);
    });
};