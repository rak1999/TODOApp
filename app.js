const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Rohit:Test-123@cluster0.cktjn.mongodb.net/todolistdb", {useNewUrlParser:true,  useUnifiedTopology: true, useFindAndModify: false });

const itemsSchema = {
    name: String
};

const Item = mongoose.model("item", itemsSchema);
const item1 = new Item({
    name: "buy coffee"
});
const item2 = new Item({
    name: "do the exercise"
});
const item3 = new Item({
    name: "Eat healthy food"
});

const database = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);


// Item.deleteMany({_id: "60e829c8cf3f2b16040277bd"},function(err){
//     if(err){
//         console.log(err);
//     }else{
//         console.log("Successfully Deleted");
//     }
// })


app.get("/", function(req,res){
   
    Item.find({},function(err, itemfound){
        if(itemfound.length === 0){
            Item.insertMany(database, function(err){
                if(err){
                    console.log(err);
                }else{
                    console.log("successfully add the data");
                }
        });
        res.redirect("/");
        }else{
            res.render("list", {listTitle :"Today", listItems: itemfound });
        }
        
    }); 
});

app.get('/:customeList', function (req, res) {
    const customeList = _.capitalize(req.params.customeList);

    List.findOne({name:customeList}, function(err,foundList){
       if(!err){
           if(!foundList){
            const list = new List({
                name: customeList,
                item: database
            });
            list.save();
            res.redirect("/")
           }else{
            res.render("list", {listTitle :foundList.name, listItems: foundList.items});
           }
       } 
    });

});

app.post("/", function(req,res){
    const itemName = req.body.list;
    const listName = req.body.List;
    const item = new Item({
        name: itemName
    });

    if(listName === "Today"){
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name:listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
    }

});

app.post("/delete", function(req,res){
    const checkItem = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndRemove(checkItem, function(err){
            if(!err){
                res.redirect("/");
            }
        });
    }else{
        List.findOneAndUpdate({name: listName},{$pull: {items: {_id:checkItem}}}, function(err,foundList){
                if(!err){
                    res.redirect("/" + listName);
                }
        })
    }
})





// app.get("/work", function(req,res){
//     res.render("list", {listTitle :"Work List", listItems: workItems });
// })

app.get("/about", function(req,res){
    res.render("about");
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function(){
    console.log("server is running on port 3000");
});