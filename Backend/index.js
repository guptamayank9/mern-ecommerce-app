const port = 4000; //port name//initialize all dependices and modules
const express = require("express"); //req expreess
const app = express(); //use
const mongoose = require("mongoose"); //require mongo
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path"); // by this can get access to backnd directory in our express app
const cors = require("cors");
require("dotenv").config();
const { log } = require("console");
const { resolveSoa } = require("dns");
const all_product_static = require('./all_product');

app.use(express.json()); //whtevr req get autmatic convert json
app.use(cors()); //reactjs to express to 4000port

//DB CONNECT with mongodb
mongoose
  .connect(
    "mongodb+srv://mayankdev:CRKnaGmMKhTNVGqh@cluster0.zbcvskl.mongodb.net/e-commerce",
  )
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log("MongoDB Error ❌", err));

//API creation
app.get("/", (req, res) => {
  res.send("Express App is Running");
});

//IMAGE store Engine
const storage = multer.diskStorage({
  destination: "./upload/images",
  filename: (req, file, cb) => {
    return cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`,
    );
  },
});
const upload = multer({ storage: storage }); //store in imag
//CREAting upload Enpoints for images
app.use("/images", express.static("upload/images"));
app.post("/upload", upload.single("product"), (req, res) => {
  res.json({
    success: true,
    image_url: `http://localhost:${port}/images/${req.file.filename}`,
  });
});
//crate schema for creating projects
const Product = mongoose.model("Product", {
  id: {
    //if id is not there ,then not add
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  new_price: {
    type: Number,
    required: true,
  },
  old_price: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  avilable: {
    type: Boolean,
    default: true, //means available
  },
});
app.post("/addproduct", async (req, res) => {
  let products = await Product.find({}); //all theproduc in arr
  let id;
  if (products.length > 0) {
    let last_product_array = products.slice(-1);
    let last_product = last_product_array[0];
    id = last_product.id + 1;
  } else {
    id = 1;
  }
  const product = new Product({
    id: id,
    name: req.body.name,
    image: req.body.image,
    category: req.body.category.toLowerCase(),
    new_price: req.body.new_price,
    old_price: req.body.old_price,
  });
  console.log(product);
  //save in db
  await product.save();
  console.log("Saved");
  res.json({
    success: true,
    name: req.body.name,
  });
});
//creating api ofr deleting products
app.post("/removeproduct", async (req, res) => {
  await Product.findOneAndDelete({ id: req.body.id });
  console.log("Removed");
  res.json({
    success: true,
    name: req.body.name,
  });
});

//Creating api for getting all products


app.get('/allproducts', async (req, res) => {
  let products = await Product.find({});
  res.json(products);
});


app.get('/importproducts', async (req, res) => {
  try {
    await Product.deleteMany({}); // old data delete

    const fixedProducts = all_product_static.map((p) => ({
      ...p,
      category: p.category === "kid" ? "kids" : p.category
    }));

    await Product.insertMany(fixedProducts);

    res.json({ success: true, message: "Products Imported ✅" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, error });
  }
});

//Schema creating for userModel
const User = mongoose.model("Users", {
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  cartData: {
    type: Object,
  },
  data: {
    type: Date,
    default: Date.now,
  },
});
//creating end point for registerng the user
app.post("/signup", async (req, res) => {
  let check = await User.findOne({ email: req.body.email });
  if (check) {
    return res
      .status(400)
      .json({
        success: false,
        errors: "existing user found with same email address",
      });
  } //if no user
  let cart = {};
  for (let i = 0; i < 300; i++) {
    cart[i] = 0;
  }
  const user = new User({
    name: req.body.username,
    email: req.body.email,
    password: req.body.password,
    cartData: cart,
  });
  await user.save();
  const data = {
    user: {
      id: user.id,
    },
  };
  const token = jwt.sign(data, process.env.JWT_SECRET);
  res.json({ success: true, token });
});
//creating end point for user login
app.post("/login", async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (user) {
    const passCompare = req.body.password === user.password;
    if (passCompare) {
      const data = {
        user: {
          id: user.id,
        },
      };
      const token = jwt.sign(data, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, errors: "Wrong Password" });
    }
  } else {
    res.json({ success: false, errors: "Wrong Email Id" });
  }
});
//creating endpoint for newcollection data 
app.get('/newcollections',async (req,res) => {
  let products = await Product.find({});
  let newcollection = products.slice(-8);
  console.log("NewCollection Fetched");
  res.send(newcollection);

})

//creating enpoint for popular in women section
app.get('/popularinwomen' ,async (req,res) => {
  let products = await Product.find({category:"women"});
  let popular_in_women = products.slice(0,4);
  console.log("Popular in women fetched");
  res.send(popular_in_women);
})
//creating middleware to fetch user
const fetchUser = async (req,res,next) => {
  const token = req.header('auth-token');
  if(!token){
    res.status(401).send({error:"Please authenticate using valid token"})
  }
  else{
    try {
      const data = jwt.verify(token,process.env.JWT_SECRET);
      req.user = data.user;
      next();
    } catch (error) {
      res.status(401).send({errors:"Please authenticate using a valid token"});
    } 
  }
}
//creating endpoint for adding products in cartdata
app.post('/addtocart',fetchUser,async (req,res) => {
    console.log("Added",req.body.itemID);
 let userData = await User.findOne({_id:req.user.id});

 if(!userData.cartData[req.body.itemID]){
  userData.cartData[req.body.itemID] = 0;
}
userData.cartData[req.body.itemID] += 1;

 await User.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});

 res.send("Added");
})
//creating endpoint to remove product from cartData
app.post('/removefromcart',fetchUser,async (req,res) => {

  console.log("removed",req.body.itemID);

  let userData = await User.findOne({_id:req.user.id});

  if(userData.cartData[req.body.itemID]>0)

 userData.cartData[req.body.itemID] -=1;

 await User.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});

 res.send("Removed");
})
//creating endpoint to get cartdata
app.post('/getcart',fetchUser,async (req,res) => {
  console.log("Get Cart");
  let userData = await User.findOne({_id:req.user.id});
  res.json(userData.cartData);
})








app.listen(port, (error) => {
  if (!error) {
    //if no err
    console.log("Server Running on Port : ", port);
  } else {
    console.log("Error :", error);
  }
});
