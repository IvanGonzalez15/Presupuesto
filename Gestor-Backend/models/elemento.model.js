'use strict';

module.exports = (sequelize, DataTypes) => {
  const Elemento = sequelize.define('Elemento', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    Nombre: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    Foto: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    Ref: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    Id_usuario_creador: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    Id_proyecto: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    Cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    Unidad_de_medida: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    Precio: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    medida_metro_cuadrado: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0
    },
    medida_metro_cubico: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'elementos',
    freezeTableName: true,
    timestamps: false
  });

  Elemento.associate = models => {
    Elemento.belongsTo(models.Usuario, {
      foreignKey: 'Id_usuario_creador',
      as: 'UsuarioCreador'
    });
    Elemento.belongsTo(models.Proyecto, {
      foreignKey: 'Id_proyecto',
      as: 'Proyecto'
    });
  };

  return Elemento;
};
