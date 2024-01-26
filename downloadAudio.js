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
  }
};

const main = async () => {
  try {
    const response = await axios.get(dataUrl);
    const audioTags = response.data.match(
      /<audio.*?src="(https:\/\/dszentrum\.com\.ua\/wp-content\/uploads\/audio\/[^"]+)"/g
    );

    const categoryCounters = {};

    for (let index = 0; index < audioTags.length; index++) {
      const audioTag = audioTags[index];
      const audioUrl = audioTag.match(
        /src="(https:\/\/dszentrum\.com\.ua\/wp-content\/uploads\/audio\/[^"]+)"/
      )[1];

      const parts = audioUrl.split("/");
      const category = parts[parts.indexOf("audio") + 1];

      categoryCounters[category] = categoryCounters[category] || 1;

      await downloadAudio(audioUrl, category, categoryCounters[category]);
      categoryCounters[category]++;
    }

    await createZipArchive();
  } catch (error) {
    console.error(`Error downloading audio files: ${error.message}`);
  }
};

main();
