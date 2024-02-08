const {getAllUsers} = require('../db/users.db')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const signUp = async(req, res)=>{
  const{Firmname, Password, Email} = req.body
  try{
    //check if the body  is empty or not
    if(!Email || !Password || !Email){
      return res.status(400).send("user body must not be empty")
    }
    //check if the user exists via email
    const userExist = await getAllUsers.findUnique({where:{Email:Email}})

    if(userExist){
      return res.status(400).send("user already exists")
    }
    //create a new password and save it in the database using hashing
    const salt = bcrypt.genSaltSync(12)
    const hashPassword = bcrypt.hashSync(Password, salt)
   //create a new database model
   const newUser = new  getAllUsers({Firmname, Password:hashPassword , Email})
   //save the new user to the data base
   await newUser.save()
  }catch(error){
    return res.status(500).json(error)
  }
}

module.exports = signUp