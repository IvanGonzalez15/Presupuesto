'use strict';

module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define('Usuario', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    rol: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    Activo: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 1
    },
    Ultimo_acceso: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    Created_At: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    Updated_At: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    tableName: 'usuarios',
    freezeTableName: true,
    createdAt: 'Created_At',
    updatedAt: 'Updated_At'
  });

  Usuario.associate = models => {
    Usuario.hasMany(models.Proyecto, {
      foreignKey: 'Responsable',
      as: 'ProyectosComoResponsable'
    });
    Usuario.belongsToMany(models.Proyecto, {
      through: 'ProyectoColaborador',
      foreignKey: 'UsuarioId',
      otherKey: 'ProyectoId',
      as: 'ProyectosComoColaborador'
    });
    Usuario.hasMany(models.Elemento, {
      foreignKey: 'Id_usuario_creador',
      as: 'ElementosCreados'
    });
  };

  return Usuario;
};
