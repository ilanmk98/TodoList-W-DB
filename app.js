//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _ = require('lodash');
const mongoose = require('mongoose');
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://0.0.0.0:27017/todolistDB");

const itemsSchema = {
  name: String
};

const Item = mongoose.model("item", itemsSchema);

const item1 = new Item({
  name: "Go to work"
});
const item2 = new Item({
  name: "Go to the gym"
});
const item3 = new Item({
  name: "Go home"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);





app.get("/", function (req, res) {

  Item.find({})
    .then((foundItems => {
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems)
          .then((result) => {
            console.log(result);
          })
          .catch((err) => {
            console.log(err);
          });
        res.redirect("/");
      }



      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }))
    .catch((err) => {
      console.log(err);
    });



});

app.post("/", function (req, res) {

  const listName = req.body.list;
  const item = new Item({
    name: req.body.newItem
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
        name: listName
      })
      .then((listFound) => {

        listFound.items.push(item);
        listFound.save();
        res.redirect("/"+listName);
      })
      .catch((err) => {
        console.log(err);
      });
      res.redirect("/"+listName);
  }




});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName==="Today") {
    Item.findByIdAndRemove(checkedItemId)
    .then((result) => {
      console.log(result);
    })
    .catch((err) => {
      console.log(result);
    });
  res.redirect("/");
  } else {
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}})
    .then((result)=>{
      console.log(result);
    })
    .catch((err)=>{
      console.log(err);
    });
    res.redirect("/"+listName);
  }

  
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({
      name: customListName
    })
    .then((foundList) => {
      if (!foundList) { //Create new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);

      } else { //Show existing list
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });

      }
    })
    .catch((err) => {
      console.log(err);
    });


})

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});