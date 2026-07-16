'use strict';

module.exports = (sequelize, DataTypes) => {
  const TarifaMaterial = sequelize.define('TarifaMaterial', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    categoria: {
      type: DataTypes.STRING(45),
      allowNull: false 
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    precio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    unidad: {
      type: DataTypes.STRING(10),
      allowNull: false 
    }
  }, {
    tableName: 'tarifa_materiales',
    freezeTableName: true,
    timestamps: false
  });

  return TarifaMaterial;
};
