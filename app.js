
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://garvitviajyvergiya:f6rX6QF1txMyjPRQ@cluster0.lzjex.mongodb.net/todolistDB",{useNewUrlParser: true ,useUnifiedTopology: true});



var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
var today = new Date();
const newdate =today.toLocaleDateString("en-US", options);

const itemsSchema = {
  name: String
};
const Item = mongoose.model("Item",itemsSchema);
// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

const item1 = new Item ({
  name : "Welcome to your todoList"
})
const item2 = new Item ({
  name : "Hit the + button to add a new item"
})
const item3 = new Item ({
  name : "Hit <-- to delete an item"
})

const defaultItems = [item1, item2, item3];

const listSchema = {
  name : String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);



app.get("/about", function(req, res){
  res.render("about");
});


app.get("/", function(req, res) {

Item.find({}, function(err, foundItems){
if(foundItems.length===0){
  Item.insertMany(defaultItems, function(err){
    if(err){
      console.log(err);
    } else {
      console.log("Succesfully saved default items to database");
    }
  });
  res.redirect("/");
} else{
  res.render("list", {listTitle:"Today",date:newdate, newListItems: foundItems});
}

});
});

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name : customListName,
          items :defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      } else {
         res.render("list",{listTitle:customListName,date:newdate, newListItems: foundList.items} )
      }
    }
  })
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
  item.save();
  res.redirect("/");
} else {
  List.findOne({name: listName}, function(err, foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName);
  })
}
});

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }


app.post("/delete", function(req,res){
  const checkedItemId = (req.body.deleteItem);
  const listName = (req.body.listName);

  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(err){
        console.log(err)
      } else {
        console.log("Succesfully Deleted Item")
        res.redirect("/");
      }
    })
  } else {
    List.findOneAndUpdate({name: listName}, {$pull:{items: {_id:checkedItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/"+ listName);
      }
    } )
  }

  });

let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started on port 3000");
});
