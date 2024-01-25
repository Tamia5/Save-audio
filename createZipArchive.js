import fse from "fs-extra";
import archiver from "archiver";

const downloadDir = "audio-files";

const createZipArchive = async () => {
  const archive = archiver("zip", { zlib: { level: 0 } });
  const zipFilename = "audio-files.zip";
  const output = fse.createWriteStream(zipFilename);

  archive.pipe(output);
  archive.directory(downloadDir, false);
  await archive.finalize();

  console.log(`Zip archive created: ${zipFilename}`);

  //   await fse.remove(downloadDir);
  //   console.log(`Download directory deleted: ${downloadDir}`);
};

export default createZipArchive;
