const { Sequelize } = require('sequelize')

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: '../sales.db',
})

module.exports = { sequelize }


// const dbName = 'sales.db'


// // change permission
// const fs = require('fs')
// fs.chmod(dbName, '777', (err) => {
//     if (err) {
//       console.error('Failed to change database permissions:', err)
//     } else {
//       console.log('Database permissions changed successfully!')
//     }
// })