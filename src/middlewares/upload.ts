import config from "../global/env";
import * as multer from "multer";
import * as multerS3 from "multer-s3";
import * as AWS from "aws-sdk";
import * as path from "path";
import * as fs from "fs";

const s3 = new AWS.S3({
  accessKeyId: config.S3_ACCESS_KEY_ID,
  secretAccessKey: config.S3_SECRET_ACCESS_KEY,
  region: "ap-northeast-1",
});

const storage = (folder: string): multer.StorageEngine => {
  if (config.PRODUCTION) {
    return multerS3({
      s3,
      bucket: "amamov",
      key(req, file, cb) {
        cb(null, `${folder}/${Date.now()}_${path.basename(file.originalname)}`);
      },
    });
  } else {
    try {
      console.log("πΎ Create a root uploads folder...");
      fs.mkdirSync(path.join(__dirname, "..", `uploads`));
    } catch (error) {
      console.log("The folder already exists...");
    }
    try {
      console.log(`πΎ Create a ${folder} uploads folder...`);
      fs.mkdirSync(path.join(__dirname, "..", `uploads/${folder}`));
    } catch (error) {
      console.log(`The ${folder} folder already exists...`);
    }
    return multer.diskStorage({
      destination(req, file, cb) {
        // μ΄λμ μ μ₯ν  μ§
        cb(null, path.join(__dirname, "..", `uploads/${folder}`));
      },
      filename(req, file, cb) {
        // μ΄λ€ μ΄λ¦μΌλ‘ μ¬λ¦΄ μ§
        const ext = path.extname(file.originalname);
        cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
      },
    });
  }
};

const multerAvatar: multer.Multer = multer({
  storage: storage("avatar"),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

export const uploadAvatar = multerAvatar.single("avatar");

// app.post(
//   "/upload",
//   upload.fields([
//     { name: "imageName", limits: 5 },
//     { name: "image2" },
//     { name: "image3" },
//   ]),
//   (req, res) => {
// app.use(upload.single("image"))λ‘ λΉΌμ£Όμ΄λ λλλ° λ³΄ν΅ μ΄λ―Έμ§λ νΉμ  λΌμ°ν°μμλ§ λ°μνλ―λ‘ λ°λ‘ λΉΌλ κ²μ΄λ€.
// upload.single : νλμ νμΌλ§ μλ‘λν  λ
// upload.fileds : νλμ νμΌλ§ μλ‘λν  κ²½μ°μμ μ¬λ¬κ°μ inputμΌλ‘ λκΈΈ λ
// upload.array : μ¬λ¬κ°μ νμΌμ μλ‘λν  λ (multiple="true")
// upload.none :  multipart/form-data νμμ΄μ§λ§ <input type="file" /> νμμ΄ μμ λ, μ¦ μ λ¬ν  μ΄λ―Έμ§κ° μμ λ
//     console.log(req.file); // μλ‘λλ μ λ³΄ νμΈ κ°λ₯
//     res.send("ok");
//   }
// );
