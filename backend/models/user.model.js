import mongoose, { mongo } from "mongoose";
import bcrypt from "bcryptjs"; // for hashing password

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, "Name is required"] // to show error message
    },
    email:{
        type: String,
        required: [true, "Email is required"],
        unique: true, // only can used once
        lowercase: true,
        trim: true // erase space on both side string (opening and closing)
    },
    password:{
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters"]
    },
    cartItems:[
        {
            quantity:{
                type: Number,
                default: 1
            },
            product: {
                type: mongoose.Schema.Types.ObjectId, // ObjectId berasal dari databasenya 
                ref: "Product"
            }
        }
    ],
    role:{
        type: String,
        enum: ["customer", "admin"],
        default: "customer"
    },
}, 
{
    timestamps: true, // created at and updated at
}
);

// pre-save hook to hash password before saving to the database
userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next()
    } catch (error) {
        next(error)
    }
});

// ex: john 123456
// 1234567 => invalid credentials (this func work)
userSchema.methods.comparePassword = async function(password){
    return bcrypt.compare(password, this.password);
}

// should be on final line, when u pass it to middle it will not work cause the userSchema is not modified yet
const User = mongoose.model("User", userSchema);

export default User;