const { Jimp } = require('jimp');
const JimpInstance = Jimp || require('jimp');

async function fixFavicon() {
  const inputPath = 'c:\\Users\\kerem.DESKTOP-COJ8PJ5\\Desktop\\Staj\\antigravity\\borsauygulama\\frontend\\public\\logo.png';
  const outputPath = 'c:\\Users\\kerem.DESKTOP-COJ8PJ5\\Desktop\\Staj\\antigravity\\borsauygulama\\frontend\\public\\favicon.png';

  try {
    const image = await JimpInstance.read(inputPath);
    
    // Just contain the image within a 128x128 square to fix the aspect ratio
    // This pads the edges without distorting or squishing the original logo.
    image.contain(128, 128);
    
    image.write(outputPath, () => {
      console.log('Successfully padded and resized logo into a square favicon!');
    });
  } catch (err) {
    console.error('Error processing image:', err);
  }
}

fixFavicon();
