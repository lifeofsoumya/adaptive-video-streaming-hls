import express from "express"
import cors from "cors"
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path"
import fs from "fs"
import { exec } from "child_process";
import { stderr, stdout } from "process";

const app = express();
app.use(express.json());

app.use(cors({
    origin: ["http://localhost:8080", "http://localhost:5173"],
    credentials: true
}))

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
// add other origins
    next();
})

app.use(express.urlencoded({extended: true}));

const storage = multer.diskStorage({ // multor middleware
    destination: function (req, file, cb) {
        cb(null, "./uploads")
    },
    filename: function(req, file, cb){
        cb(null, file.fieldname + "-" + uuidv4() + path.extname(file.originalname))
    }
})

const upload = multer({storage: storage}); // multer configuration

app.use("/uploads", express.static("uploads"))

app.get("/", (req, res)=> {
    res.json({message: "server running"})
})

app.post("/upload", upload.single('file'), (req, res) => {
    // console.log('file received')
    const lessonId = uuidv4();
    // console.log(req)
    const videoPath = req.file.path // implement s3 grabbing here
    const outputPath = `./uploads/hlsready/${lessonId}`
    const hlsPath = `${outputPath}/index.m3u8` // stores the index in text format with timestamps and partitions to play

    if(!fs.existsSync(outputPath)){
        fs.mkdirSync(outputPath, {recursive: true});
    }

    const ffmpegExecCommand = `ffmpeg -i ${videoPath} -codec:v libx264 -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${outputPath}/segment%03d.ts" -start_number 0 ${hlsPath}`;

    exec(ffmpegExecCommand, (error, stdout, stderr)=> {
        if(error) console.log('exec error ', error)
        console.log('stdout ', stdout)
        console.log('stderr ', stderr)

        const videoUrl = `http://localhost:8080/uploads/hlsready/${lessonId}/index.m3u8`
        res.json({videoUrl});
    })

})
app.listen(8080, () => console.log('server running on 8080'))