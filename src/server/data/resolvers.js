import { Order, Dish, DishType } from "./Models"

const resolvers = {
  Query: {
    orders(_, args) {
      return Order.find(args)
    },
    dishes(_, args){
      return Dish.find(args)
    },
    dishTypes(_, args){
      return DishType.find(args)
    }
  },
  Mutation: {
    addOrder(_, args){
      return Order.create(args)
    },
    addDish(_, args){
      return Dish.create(args)
    },
    updateDish(_, args){  
      const id = args._id
      delete args._id
      return new Promise((resolve, reject) => {
        Dish.update({ _id: id }, args, (e, r) => {
          if (e)
            reject(e)
          Dish.findOne({_id: id}, (e, r) => {
            if (e)
              reject(e)
            resolve(r)
          })
        })
      })
    },
    removeDish(_, args){
      return Dish.findOneAndRemove({_id: args._id})
    },
    addDishType(_, args){
      return DishType.create(args)
    },
    updateDishType(_, args) {
      const id = args._id
      delete args._id
      return new Promise((resolve, reject) => {
        DishType.update({ _id: id }, { name: args.name }, (e, r) => {
          if (e)
            reject(e)
          DishType.findOne({_id: id}, (e, r) => {
            if (e)
              reject(e)
            resolve(r)
          })
        })
      })
    },
    removeDishType(_, args) {
      return new Promise((res, rej) => {
        Dish.find({type: args._id}).then( r => {
          if (r.length > 0) {
            rej("Some dishes with this dish type still exist. Remove those dishes first, before removing the dish type.")
            return
          }

          DishType.findOneAndRemove({ _id: args._id }).then(res).catch(rej)
        }).catch(rej)
      })
    },
    updateOrder(_, args) {
      const id = args._id
      delete args._id
      return new Promise((resolve, reject) => {
        if (args.dishes){
          args.hasPayed = args.dishes.length === 0 ? (!args.name && !args.table && !args.notes ? true : false) : args.dishes.every(d => d.hasPayed)
        }

        Order.update({ _id: id }, args, (err, result) => {
          if (err)
            reject(err)

          Order.findOne({_id: id}, (e, r) => {
            if (e) //TODO: Rollback here!!
              reject(e)
            resolve(r)
          })
        })
      })
    },
    joinOrders(_, args) {
      const id = args._id
      delete args._id
      const allIds = args.orderIds.concat([id]);
      return new Promise((resolve, reject) => {
        Order.find({_id: {$in: allIds}}, (e, r) => {
          if (e)
            reject(e)
          else 
            Order.update({
                  _id: id
                }, {
                  dishes: [].concat.apply([], r.map(m => m.dishes))
                }, ((e, r) => {
              if (e)
                reject(e)
              else
                Order.remove({_id: {$in: args.orderIds} }, (e, r) => {
                  if (e)
                    reject(e)
                  else
                    Order.findOne({_id: id}, (e, r) => {
                      if (e) //TODO: Rollback here!!
                        reject(e)
                      resolve(r)
                    })
                })
            }))
        })
      })
    }
  },
  Dish: {
    type(dish) {
      return DishType.findOne({ _id: dish.type })
    },
  },
  OrderDish: {
    dish(orderDish) {
      return Dish.findOne({ _id: orderDish.id })
    },
  },
  Order: {
    dishes(order){
      return order.dishes
    }
  }
};

export default resolvers;