const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Account = require('./Account');


const Post = sequelize.define('Post', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    caption: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    type: {
        type: DataTypes.ENUM('FEED', 'STORY'),
        defaultValue: 'FEED',
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    scheduledTime: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('SCHEDULED', 'PUBLISHED', 'FAILED'),
        defaultValue: 'SCHEDULED',
    },
    instagramId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    accountId: {
        type: DataTypes.INTEGER,
        references: {
            model: Account,
            key: 'id',
        },
        allowNull: true, // Allow null for backward compatibility or simplistic testing
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    recurrenceGroupId: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    recurrenceInterval: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    recurrenceTotal: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    recurrenceCurrent: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
    }
}, {
    timestamps: true,
});

Post.belongsTo(Account, { foreignKey: 'accountId' });
Account.hasMany(Post, { foreignKey: 'accountId' });

const User = require('./User');
Post.belongsTo(User, { foreignKey: 'userId' });
Account.belongsTo(User, { foreignKey: 'userId' });

module.exports = Post;

