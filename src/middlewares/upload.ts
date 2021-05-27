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
      console.log("💾 Create a root uploads folder...");
      fs.mkdirSync(path.join(__dirname, "..", `uploads`));
    } catch (error) {
      console.log("The folder already exists...");
    }
    try {
      console.log(`💾 Create a ${folder} uploads folder...`);
      fs.mkdirSync(path.join(__dirname, "..", `uploads/${folder}`));
    } catch (error) {
      console.log(`The ${folder} folder already exists...`);
    }
    return multer.diskStorage({
      destination(req, file, cb) {
        // 어디에 저장할 지
        cb(null, path.join(__dirname, "..", `uploads/${folder}`));
      },
      filename(req, file, cb) {
        // 어떤 이름으로 올릴 지
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
// app.use(upload.single("image"))로 빼주어도 되는데 보통 이미지는 특정 라우터에서만 발생하므로 따로 빼는 것이다.
// upload.single : 하나의 파일만 업로드할 때
// upload.fileds : 하나의 파일만 업로드할 경우에서 여러개의 input으로 넘길 때
// upload.array : 여러개의 파일을 업로드할 때 (multiple="true")
// upload.none :  multipart/form-data 형식이지만 <input type="file" /> 형식이 없을 때, 즉 전달할 이미지가 없을 떄
//     console.log(req.file); // 업로드된 정보 확인 가능
//     res.send("ok");
//   }
// );
