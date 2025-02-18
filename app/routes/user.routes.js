module.exports = app => {
    const users = require("../controllers/user.controller.js");
  
    var router = require("express").Router();
  
    router.post("/", users.create);
    router.get("/", users.getAll);
    router.get("/:id", users.getOne);
    router.put("/:id", users.update);
    router.delete("/:id", users.delete);
  
    app.use("/api/user", router);
  };
  