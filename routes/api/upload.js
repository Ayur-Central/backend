const express = require('express');
const router = express.Router();
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");

// @route    POST api/upload
// @desc     Upload File
// @access   Public
router.post(
    '/',
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const orderBody = req.body;
        const id = orderBody.orderId;

        try {
            let order = await Order.findOne({ orderId: id });

            if (order) {
                return res.status(400).json({ msg: 'order with same Id already exists!' });
            }

            order = new Order({
                ...orderBody
            });

            await order.save();
            res.json({ msg: 'order Added Successfully!', order: order });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now())
    }
  })
 
var upload = multer({ storage: storage })

router.get("/",(req,res)=>{
    res.render("index");
})
 
router.post("/uploadphoto", upload.single('myImage'),(req,res)=>{
    var img = fs.readFileSync(req.file.path);
    var encode_img = img.toString('base64');
    var final_img = {
        contentType:req.file.mimetype,
        image:new Buffer(encode_img,'base64')
    };
    imageModel.create(final_img,function(err,result){
        if(err){
            console.log(err);
        }else{
            console.log(result.img.Buffer);
            console.log("Saved To database");
            res.contentType(final_img.contentType);
            res.send(final_img.image);
        }
    })
})

module.exports = router;