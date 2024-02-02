function updateMiniCart(val){
    let miniHeader = document.querySelector("#mini-cart");
    miniHeader.textContent = "("+val+")";
}

function triggerNotification(message){
    let notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');
    setTimeout(function() {
        notification.classList.remove('show');
    }, 3000);
}

async function addToCart(productId) {
    try {
        
      const response = await fetch('/add-to-cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add product to cart: ${response.statusText}`);
      }

      const result = await response.json();
      updateMiniCart(result.cartSize);
      this.triggerNotification(result.message);
    } catch (error) {
      console.error(error);
    }
}

async function removeFromCart(productId,onSuccess=null){
    try {
        
        const response = await fetch('/remove-cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productId }),
        });
  
        if (!response.ok) {
          throw new Error(`Failed to add product to cart: ${response.statusText}`);
        }
  
        const result = await response.json();
        updateMiniCart(result.cartSize);
        this.triggerNotification(result.message);
        if(typeof onSuccess === 'function'){
            onSuccess(result);
        }
      } catch (error) {
        console.error(error);
      }
}