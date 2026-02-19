const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const BioPage = sequelize.define('BioPage', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            is: /^[a-z0-9-]+$/i, // Only alphanumeric and hyphens
            len: [3, 50]
        }
    },
    title: {
        type: DataTypes.STRING,
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    profileImageUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    backgroundImageUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    backgroundColor: {
        type: DataTypes.STRING,
        defaultValue: '#000000'
    },
    textColor: {
        type: DataTypes.STRING,
        defaultValue: '#ffffff'
    },
    links: {
        type: DataTypes.JSON, // Array of { title, url, icon, scheduleStart, scheduleEnd }
        defaultValue: []
    },
    fontFamily: {
        type: DataTypes.STRING,
        defaultValue: 'Inter'
    },
    buttonColor: {
        type: DataTypes.STRING,
        defaultValue: '#6366f1' // Indigo-500 default
    },
    showLogo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'BioPages'
});

module.exports = BioPage;
