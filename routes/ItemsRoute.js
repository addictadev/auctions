// const express = require('express');
// // const userController = require('./../controllers/userController');
// const {registerUser, loginUser} = require('./../controllers/authcontroller/authcontroller');

// const router = express.Router();

// router.post('/signup', registerUser);
// router.post('/login', loginUser);
// module.exports = router;











const express = require('express');
const {
createitems,getAllitems,getitems,deleteitems,updateitems
} = require('../controllers/items/itemsController');
const authMiddleware = require('../middleware/authMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');
const checkPermission = require('../middleware/checkPermission ');

const itemValidator = require('../validationswithexpress/itemValidator');
const mult = require('../utils/multer');
const AppError = require('../utils/appError');
const upload = mult('images/items')
const router = express.Router();

function generateValidFilePath(filename) {
    const parts = filename.split(/[\\/]/); // Split the filename by both forward slash (/) and backslash (\)
    const formattedParts = parts.map(part => part.replace(/\\/g, '/')); // Replace backslashes (\) with forward slashes (/)
    const validPath = formattedParts.join('/'); // Join the parts back together with forward slashes (/)
    return validPath;
  }





router.post('/',upload.fields([
    { name: 'coverphoto', maxCount: 1 },
    { name: 'thubnailphoto', maxCount: 100 },

  ])
  ,(req,res,next)=>{

  if (!req.files && req.files.thubnailphoto && req.files.thubnailphoto.length > 0) {
    // return ne.status(400).send('No file uploaded.');
    return  next(new AppError('No file uploaded thubnailphoto.', 400));
  }
  if (!req.files && req.files.coverphoto && req.files.coverphoto.length > 0) {
    // return ne.status(400).send('No file uploaded.');
    return  next(new AppError('No file uploaded thubnailphoto.', 400));
  }

  req.body.thubnailphoto = req.files.thubnailphoto?.map(file => ({
    name: file.originalname,
    path: generateValidFilePath(file.path),
    pathname: file.filename
  }));

req.body.coverphoto ={name:req.files.coverphoto[0].originalname,path: generateValidFilePath(req.files.coverphoto[0].path),pathname:req.files.coverphoto[0].filename};

next()

},itemValidator.createItem,validationMiddleware,createitems );



// ,checkPermission()
router.get('/',authMiddleware,getAllitems );
router.get('/:id', getitems);



router.put('/:id',upload.fields([
    { name: 'coverphoto', maxCount: 1 },
    { name: 'thubnailphoto', maxCount: 1 },

  ]),(req,res,next)=>{
  console.log(req.files)
  console.log(req.body)
    if (req.files && req.files.thubnailphoto && req.files.thubnailphoto.length > 0) {
      // return ne.status(400).send('No file uploaded.');
      req.body.thubnailphoto ={name:req.files.thubnailphoto[0].originalname,path: generateValidFilePath(req.files.thubnailphoto[0].path),pathname:req.files.thubnailphoto[0].filename};
    }
    if (req.files && req.files.files && req.files.files.length > 0) {
      // return ne.status(400).send('No file uploaded.');
      req.body.files ={name:req.files.files[0].originalname,path: generateValidFilePath(req.files.files[0].path),pathname:req.files.files[0].filename};
    }
    
  next()
  },updateitems);



router.delete('/:id', deleteitems);
module.exports = router;
