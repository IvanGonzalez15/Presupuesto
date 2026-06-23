'use strict';

module.exports = (sequelize, DataTypes) => {
  const Cliente = sequelize.define('Cliente', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    Nombre: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    Persona_contacto: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    Email_contacto: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    Numero_contacto: {
      type: DataTypes.STRING(45),
      allowNull: true,
      unique: true
    }
  }, {
    tableName: 'clientes',
    freezeTableName: true,
    timestamps: false
  });

  Cliente.associate = models => {
    Cliente.hasMany(models.Proyecto, {
      foreignKey: 'Id_Cliente',
      as: 'Proyectos'
    });
  };

  return Cliente;
};
