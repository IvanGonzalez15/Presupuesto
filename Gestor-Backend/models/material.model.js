'use strict';

module.exports = (sequelize, DataTypes) => {
  const Material = sequelize.define('Material', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    precio_venta: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0
    },
    caracteristicas: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    notas: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'materiales',
    freezeTableName: true,
    timestamps: false
  });

  return Material;
};
