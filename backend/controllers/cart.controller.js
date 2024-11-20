import Product from "../models/product.model.js";

export const getCartProducts = async (req, res) => {
    try {
        const products = await Product.findById({_id:{$in:req.user.cartItems}});

        // add quantity for each product
        const cartItems = products.map((product) => {
            const item = req.user.cartItems.find(cartItem => cartItem.id === product._id);
            return {...product.toJSON(), quantity: item.quantity};
        })

        res.json(cartItems)
    } catch (error) {
        console.log("Error in getCartProducts controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const addToCart = async (req, res) => {
    try {
        const {productId} =req.body;
        const user = req.user; // get user from middleware

        const existingItem = user.cartItems.find(item => item.id === productId);
        if(existingItem) {
            exisitingItem.quantity += 1;
        } else {
            user.cartItems.push(productId)
        }

        await user.save();
        res.json(user.cartItems)
    } catch (error) {
        console.log("Error in addToCart controller", error.message);
        res.status(500).json({ message: "error.message", error: error.message });
    }
};

export const removeAllFromCart = async (req, res) => {
    try {
        const {productId} =req.body;
        const user = req.user; // get user from middleware

        // if productId doenst exist it will return cart item as it is
        if(!productId) {
            user.cartItems = [];
        } else {
            user.cartItems = user.cartItems.filter((item) => item.id !== productId);
        }
        await user.save();
        res.json(user.cartItems);
    } catch (error) {
        res.status(500).json({ message: "error.message", error: error.message });
    }
};

export const updateQuantity = async (req, res) => {
    try {
        // why use req.params? because we get it from url that req id
        const {id:productId} = req.params;
        const {quantity} = req.body;
        const user = req.user;
        const exisitingItem = user.cartItems.find(item => item.id === productId);

        if(exisitingItem) {
            // this func will delete the product if quantity is 0 from the cart item
            if(quantity === 0) {
                user.cartItems = user.cartItems.filter((item) => item.id !== productId);
                await user.save();
                return res.json(user.cartItems);
            }

            // else just decrement or increment the quantity
            exisitingItem.quantity = quantity;
            await user.save();
            res.json(user.cartItems);
        } else {
            res.status(404).json({message: "Product not found"});
        }
    } catch (error) {
        console.log("Error in updateQuantity controller", error.message);
        res.status(500).json({ message: "error.message", error: error.message });
    }
};