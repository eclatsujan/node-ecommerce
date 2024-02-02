const getCartTotal = (cart)=>{
    return cart.reduce((accum,currentValue)=>{
        return accum + (currentValue.price * currentValue.quantity)
    },0); 
}

module.exports = {getCartTotal}