const express = require('express')
const multer = require('multer')


const app = express()
const upload = multer({
  // Upload to the server's memory
  storage: multer.memoryStorage()
}).single('data')


// Convert CSV format to JSON format
function CSVToJson(csv, delimiter = ",", having_headers = true) {
  var lines = csv.split("\n");
  var result = [];
  var i = 0;
  if (having_headers) {
    i = 1
  }
  var headers = lines[0].split(delimiter);
  for (; i < lines.length; i++) {
    var obj = {};
    var temp = lines[i].split(delimiter);
    if (temp[0] == "") {
      break;
    }
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = temp[j];
    }
    result.push(obj);
  }

  return result
}

app.post('/', async (req, res, next) => {
  console.log("Uploading")
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.

    } else if (err) {
      // An unknown error occurred when uploading.

    }
    // Everything went fine.

    if (err) {
      console.error(err)
      return next(err)
    }

    // console.log('req.file', req.file)
    // console.log('req.body', req.body)

    var allowed_mine_types = [
      'text/csv',
      'application/json'
    ]

    if (allowed_mine_types.includes(req.file.mimetype)) {
      // const multerText = Buffer.from(req.file.buffer).toString("utf-8") 
      const multerText = req.file.buffer.toString("utf-8")

      switch (req.file.mimetype) {
        case 'text/csv':
          req.body.data = CSVToJson(multerText)
          break
        case 'text/json':
          req.body.data = multerText
          break
      }
      console.log("Uploaded")

      console.log(req.file)
      return res.json(req.body)
    } else {
      const message = `File format ${req.file.mimetype} is not allowed`
      console.error(message)
      return next(new Error(message))
    }
  })
})

app.use(function (err, req, res, next) {
  res.json(err)
})




app.listen(9999)