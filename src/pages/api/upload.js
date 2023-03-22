import formidable from "formidable";
import path from "path";
import fs from "fs/promises";
import { exec } from "child_process"
import * as crypto from "crypto"

export const config = {
  api: {
    bodyParser: false,
  },
};

const generateId = () => {
  return crypto.randomBytes(16).toString("hex")
}

const readFile = (req, saveLocally, id) => {
  const options = {};
  if (saveLocally) {
    options.uploadDir = path.join(process.cwd(), "/python_file/data/upload_file");
    options.filename = (name, ext, path, form) => {
      return `${id}.csv`;
    };
  }
  options.maxFileSize = 4000 * 1024 * 1024;
  const form = formidable(options);

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });
};

const handler = async (req, res) => {
  try {
    await fs.readdir(path.join(process.cwd() + "/flightPath"));
  } catch (error) {
    await fs.mkdir(path.join(process.cwd() + "/flightPath"));
  }
  const uploadId = generateId();
  await readFile(req, true, uploadId);
  console.log("exec...")
  try {
    exec(`python3 ./python_file/get_complete_data.py ${uploadId}`, (error, stdout, stderr) => {
      if (error) {
        console.log("ERRORRRRRRR")
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
    })  
  } catch(error) {
    console.log("ERRORRRRRRR ZAZA")
    console.error(error)
    res.json({ success: false, id: uploadId, error: error.toString() });
  }
  res.json({ success:  true, id: uploadId });
  
};

export default handler;
