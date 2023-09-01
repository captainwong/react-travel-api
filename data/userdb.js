const uuid = require('uuid').v4;

function CartItemId() {
  this.id = 0;
  this.next = () => {
    return ++this.id;
  }
}

const cartItemIdMgr = new CartItemId();

function CartItem(touristRouteId, originalPrice, price) {
  this.id = cartItemIdMgr.next();
  this.touristRouteId = touristRouteId;
  this.originalPrice = originalPrice;
  this.price = price;
}

function Cart(userId) {
  this.id = uuid();
  this.userId = userId;
  this.items = [];

  this.addCartItem = (item) => {
    this.items.push(item);
  }

  this.removeCartItems = (ids) => {
    this.items = this.items.filter((item) => {
      return !ids.includes(item.id);
    });
  }

  this.clear = () => {
    this.items = [];
  }
}

function OrderItem(cartItem) {
  this.id = uuid();
  this.touristRouteId = cartItem.touristRouteId;
}

function Order(userId) {
  this.id = uuid();
  this.userId = userId;
  this.state = "Pending";
  this.orderItems = [];
}

function User(email, password) {
  this.id = uuid();
  this.email = email;
  this.password = password;
  this.cart = new Cart(this.id);
  this.orders = [];
}

let users = {};

users["test"] = new User("test", "AHqjAvijcygr7Tf");

const userdb = {
  userExists: (email, password) => {
    return (users.hasOwnProperty(email) &&
      (password ? users[email].password === password : true)) ? users[email] : null;
  },

  addUser: (email, password) => {
    users[email] = new User(email, password);
  },

  getUser: (email) => {
    return users[email];
  },

  // return user
  addCartItem: (user, touristRouteId, originalPrice, price) => {
    user.cart.addCartItem(new CartItem(touristRouteId, originalPrice, price));
    return user;
  },

  // return user
  removeCartItems: (user, ids) => {
    user.cart.removeCartItems(ids);
    return user;
  },

  clearCart: (user) => {
    user.cart.clear();
  },

  debug: () => {
    console.log(users);
    return users;
  },

  checkout: (user) => {
    if (user.cart.length === 0) {
      return null;
    }

    let cart = user.cart.items;
    user.cart.clear();

    let order = new Order(user.id);
    cart.forEach((item) => {
      order.orderItems.push(new OrderItem(item));
    })
    user.orders.push(order);
    return order;
  },

  getOrders: (user) => {
    return user.orders;
  },

  placeOrder: (user, orderId) => {
    for (let order of user.orders) {
      if (order.id === orderId) {
        order.state = "Completed";
        return order;
      }
    }
    return null;
  },
}

module.exports = userdb;
