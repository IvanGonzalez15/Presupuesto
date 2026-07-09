'use strict';

module.exports = (sequelize, DataTypes) => {
  const VersionProyecto = sequelize.define('VersionProyecto', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    Id_proyecto: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    creado_por: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    proyecto_metadata: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    elementos_snapshot: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'proyecto_versiones',
    freezeTableName: true,
    timestamps: false
  });

  VersionProyecto.associate = models => {
    VersionProyecto.belongsTo(models.Proyecto, {
      foreignKey: 'Id_proyecto',
      as: 'Proyecto'
    });
    VersionProyecto.belongsTo(models.Usuario, {
      foreignKey: 'creado_por',
      as: 'Creador'
    });
  };

  return VersionProyecto;
};
