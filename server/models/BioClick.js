const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const BioClick = sequelize.define('BioClick', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    bioPageId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    linkIndex: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'BioClicks',
    timestamps: false
});

module.exports = BioClick;
