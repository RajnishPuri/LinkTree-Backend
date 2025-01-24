import Jimp from 'jimp';

export const createProfilePhoto = async (name: string) => {
    try {
        const initial = name.charAt(0).toUpperCase();
        const width = 256;
        const height = 256;

        const image = await Jimp.create(width, height, '#eeeeee');

        const font = await Jimp.loadFont(Jimp.FONT_SANS_128_BLACK);

        image.print(
            font,
            0,
            0,
            {
                text: initial,
                alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
            },
            width,
            height
        );

        return await image.getBufferAsync(Jimp.MIME_PNG);
    } catch (error) {
        console.error('Error generating profile photo:', error);
        throw error;
    }
};
