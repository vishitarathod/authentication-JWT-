const mongoose=require('mongoose');
const bcrypt=require('bcrypt');
const userSchema=new mongoose.Schema({
    email:{
        type:String,
        require:true,
        unique:true,
        lowercase:true
    },
    password:{
        type: String,
        require:true,
    }
});

userSchema.pre('save',async function(next){
    try {
    //   console.log("called before saving the user..")  
        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(this.password,salt)
        this.password=hashedPassword;
        next();
    } catch (error) {
        next(error)
    }
});

userSchema.methods.isValidPassword=async function(password){
    try {
        return await bcrypt.compare(password,this.password)
    } catch (error) {
        throw error
    }
}

// userSchema.post('save',async function(next){
//     try {
//       console.log("called after saving the user..")  
//     } catch (error) {
//         next(error)
//     }
// });


const User=mongoose.model('user',userSchema);

module.exports=User;