function CartItem(id, touristRouteId, originalPrice, price) {
  this.id = id;
  this.touristRouteId = touristRouteId;
  this.originalPrice = originalPrice;
  this.price = price;
}

function OrderItem() {

}

function Order(id, userId) {
  this.id = id;
  this.userId = userId;
  this.state = "Pending";
  this.orderItems = [];
}

function User(email, password) {
  this.id = email;
  this.email = email;
  this.password = password;
  this.cart = [];
  this.cartItemsId = 0;
}

let users = {};

users["test"] = new User("test", "AHqjAvijcygr7Tf");

// {
//   "values.username": {
//     id: "values.username",
//     email: "values.username",
//     password: "values.password",
//     cart: [

//     ],
//     cartItemsId: 0
//   }
// };

const userdb = {
  userExists: (email, password) => {
    return (users.hasOwnProperty(email) && (password ? users[email].password === password : true)) ? users[email] : null;
  },

  addUser: (email, password) => {
    users[email] = new User(email, password);
  },

  getUser: (email) => {
    return users[email];
  },

  // return user
  addCartItem: (email, touristRouteId, originalPrice, price) => {
    let user = users[email];
    user.cart.push(new CartItem(++user.cartItemsId, touristRouteId, originalPrice, price));
    return user;
  },

  // return user
  removeCartItems: (email, ids) => {
    console.log('removeCartItems', ids);
    let user = users[email];
    try {
      user.cart = user.cart.filter((item) => {
        return !ids.includes(item.id);
      });
    } catch (e) {
      console.log(e);
    }
    return user;
  },

  clearCart: (email) => {
    users[email].cart = [];
    users[email].cartItemsId = 0;
  },

  debug: () => {
    console.log(users);
    return users;
  },
}

module.exports = userdb;
