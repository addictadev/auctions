const jwt = require('jsonwebtoken');
const CategorySchema = require('../../models/subcategory');
const Subcategory = require('../../models/subcategory');
const Deposit = require('../../models/Deposit');
const Item = require('../../models/item');
const Booking = require('../../models/bookenigfile'); // Adjust the path as needed

const APIFeatures = require('../../utils/apiFeatures');
const catchAsync = require('../../utils/catchAsync');
const factory = require('../../utils/apiFactory');


exports.getAllCategory = factory.getAll(CategorySchema);
// exports.getCategory = async (req, res) => {
//   const { id } = req.params;
//   const userId = req.user ? req.user._id : null;
//   try {
//     let deposit = null;
//     let subcategory = null;

//     if (userId) {
//       deposit = await Deposit.findOne({ userId:userId, item: id }).populate('item');
//       console.log(deposit)
//     }

//     if (!deposit) {
//       subcategory = await CategorySchema.findById(id).populate('items');
//     }

//     return    res.status(200).json({
//       status: 'success',
//       data: {
//         depositStatus: deposit ? deposit.status : 'false',
//         subcategory: deposit ? deposit.item : subcategory
//       }
//     });
//   } catch (error) {
//     console.log(error)
//     return res.status(500).json({ error: 'An error occurred' });
//   }
// };







exports.getCategory = async (req, res) => {
  const { id } = req.params;
  const userId = req.user ? req.user._id : null;

  try {
    let subcategory = null;
    let depositStatus = 'false';
    let bookingStatus = 'false';

    if (userId) {
      const booking = await Booking.findOne({ userId: userId, item: id  }).populate('item').sort({ createdAt: -1 });
      
      if (booking) {
        bookingStatus = booking.status;
        subcategory = await Subcategory.findById(id).populate('items');

        const deposit = await Deposit.findOne({ userId: userId, item: id }).sort({ createdAt: -1 });
        if (deposit) {
          depositStatus = deposit.status;
        }
      } else {
        // User has no approved booking or no booking at all
        subcategory = await Subcategory.findById(id).select('-files').populate('items');
      }
    } else {
      // User is not logged in, return subcategory without files and set statuses to false
      subcategory = await Subcategory.findById(id).select('-files').populate('items');
    }

    return res.status(200).json({
      status: 'success',
      data: {
        depositStatus,
        bookingStatus,
        subcategory
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'An error occurred' });
  }
};

exports.createCategory = factory.createOne(CategorySchema);
exports.updateCategory = factory.updateOne(CategorySchema);
exports.deleteCategory = factory.deleteOne(CategorySchema);

exports.getSubcategories = async (req, res) => {
    try {
      const features = await new APIFeatures(Subcategory.find().populate('items'), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
  
      const subcategories = await features.query.lean();
  
      const subcategoriesWithNearestItem = await Promise.all(subcategories.map(async (subcategory) => {
        const nearestItem = await Item.findOne({
          subcategoryId: subcategory._id,
          startDate: { $gte: new Date() }
        }).sort({ createdAt: 1 }).select('startDate _id name').lean().exec() || null;
  
        // delete subcategory.items;
  
        return {
          subcategory,
          nearestItem
        };
      }));
        res.status(200).json({
        status: 'success',
        Result:subcategoriesWithNearestItem.length,
        data: subcategoriesWithNearestItem
      });

    } catch (error) {
      console.log(req.body)
      res.status(500).json({
        status: 'error',
        message: error.message
      });
      // next(error);
    }
  };
  

// exports.getSubcategories = async (req, res) => {
//     try {
//       const subcategories = await Subcategory.find().populate('items').select('startDate _id');
  
//       const subcategoriesWithNearestItem = await Promise.all(subcategories.map(async (subcategory) => {
//         const nearestItem = await Item.findOne({
//           subcategoryId: subcategory._id,
//           startDate: { $gte: new Date() }
//         }).sort({ startDate: 1 }).limit(1).select("starData").exec() || null; // Ensure nearestItem is null if no future item is found
//     console.log(subcategory.items)

//         return {
//             subcategory,
//             nearestItem
//         };
//     }));
//     res.status(200).json({
//         status: 'success',
//         results: subcategoriesWithNearestItem.length,

//         data: {
//           data: subcategoriesWithNearestItem
//         }
//       });

//     //   res.status(200).json({
//     //     status: 'success',
//     //     Result:subcategoriesWithNearestItem.length,
//     //     data: subcategoriesWithNearestItem
//     //   });
//     } catch (error) {
//       res.status(500).json({
//         status: 'error',
//         message: error.message
//       });
//     }
//   };









// const Subcategory = require('../models/subcategory');
// const Item = require('../models/item');
// const { deleteImage } = require('../utils/imageUtils');

// const getSubcategories = async (req, res) => {
//   try {
//     const subcategories = await Subcategory.find({ categoryId: req.params.categoryId }).lean();

//     const subcategoriesWithDetails = await Promise.all(subcategories.map(async (subcategory) => {
//       const itemCount = await Item.countDocuments({ subcategoryId: subcategory._id });
//       return { ...subcategory, itemCount };
//     }));

//     res.status(200).json(subcategoriesWithDetails);
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// const getSubcategoryById = async (req, res) => {
//   try {
//     const subcategory = await Subcategory.findById(req.params.id).lean();
//     if (!subcategory) {
//       return res.status(404).json({ error: 'Subcategory not found' });
//     }

//     const itemCount = await Item.countDocuments({ subcategoryId: subcategory._id });
//     res.status(200).json({ ...subcategory, itemCount });
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// const createSubcategory = async (req, res) => {
//   try {
//     const { name, categoryId } = req.body;
//     const image = req.file.path;

//     const subcategory = new Subcategory({ name, categoryId, image });
//     await subcategory.save();

//     res.status(201).json(subcategory);
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// const updateSubcategory = async (req, res) => {
//   try {
//     const { name, categoryId } = req.body;
//     const image = req.file ? req.file.path : null;

//     const subcategory = await Subcategory.findById(req.params.id);
//     if (!subcategory) {
//       return res.status(404).json({ error: 'Subcategory not found' });
//     }

//     subcategory.name = name;
//     subcategory.categoryId = categoryId;
//     if (image) {
//       deleteImage(subcategory.image);
//       subcategory.image = image;
//     }
//     await subcategory.save();

//     res.status(200).json(subcategory);
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// const deleteSubcategory = async (req, res) => {
//   try {
//     const subcategory = await Subcategory.findById(req.params.id);
//     if (!subcategory) {
//       return res.status(404).json({ error: 'Subcategory not found' });
//     }

//     await subcategory.remove();
//     res.status(200).json({ message: 'Subcategory deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// module.exports = {
//   getSubcategories,
//   getSubcategoryById,
//   createSubcategory,
//   updateSubcategory,
//   deleteSubcategory
// };
