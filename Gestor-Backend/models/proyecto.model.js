'use strict';

module.exports = (sequelize, DataTypes) => {
  const Proyecto = sequelize.define('Proyecto', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    proyecto: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    Codigo: {
      type: DataTypes.STRING(45),
      allowNull: false,
      unique: true
    },
    Fecha_entrega: {
      type: DataTypes.DATE,
      allowNull: false
    },
    Responsable: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    Id_Cliente: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'proyectos',
    freezeTableName: true,
    timestamps: false
  });

  Proyecto.associate = models => {
    Proyecto.belongsTo(models.Cliente, {
      foreignKey: 'Id_Cliente',
      as: 'Cliente'
    });
    Proyecto.belongsTo(models.Usuario, {
      foreignKey: 'Responsable',
      as: 'UsuarioResponsable'
    });
    Proyecto.belongsToMany(models.Usuario, {
      through: 'ProyectoColaborador',
      foreignKey: 'ProyectoId',
      otherKey: 'UsuarioId',
      as: 'Colaboradores'
    });
    Proyecto.hasMany(models.Elemento, {
      foreignKey: 'Id_proyecto',
      as: 'Elementos'
    });
  };

  return Proyecto;
};
