import axios from "axios";
import fs from "fs/promises";
import createZipArchive from "./createZipArchive.js";

const dataUrl =
  "https://dszentrum.com.ua/audioprimaplus/#1592835398483-949d9a5f-b7c8";

const downloadDir = "audio-files";

const downloadAudio = async (dataUrl, category, index) => {
  try {
    const response = await axios.get(dataUrl, { responseType: "arraybuffer" });
    const categoryDir = `${downloadDir}/${category}`;

    try {
      await fs.access(categoryDir);
    } catch (error) {
      await fs.mkdir(categoryDir, { recursive: true });
    }

    const audioFilename = `${categoryDir}/${index}.mp3`;
    await fs.writeFile(audioFilename, response.data);

    console.log(`Download: ${audioFilename}`);
  } catch (error) {
    console.error("Error downloading audio files");
    console.error(error.stack);
  }
};

const main = async () => {
  try {
    const response = await axios.get(dataUrl);
    const audioTags = response.data.match(
      /<audio.*?src="https:\/\/dszentrum\.com\.ua\/wp-content\/uploads\/audio\/([^\/]+)\/([^"]+)"/g
    );

    const categoryCounters = {};

    for (const audioTag of audioTags) {
      const [, category, fileName] = audioTag.match(
        /<audio.*?src="https:\/\/dszentrum\.com\.ua\/wp-content\/uploads\/audio\/([^\/]+)\/([^"]+)"/
      );

      categoryCounters[category] = categoryCounters[category] || 1;

      const audioUrl = `https://dszentrum.com.ua/wp-content/uploads/audio/${category}/${fileName}`;
      await downloadAudio(audioUrl, category, categoryCounters[category]);
      categoryCounters[category]++;
    }

    await createZipArchive();
  } catch (error) {
    console.error(`Error downloading audio files: ${error.message}`);
  }
};

main();
