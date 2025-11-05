import { DataTypes, Model, Sequelize } from "sequelize";

// Enum types should match your DB definition
export type PlanType = "free" | "pro" | "enterprise";
export type StatusType = "Y" | "N";

// Define Tenant attributes
interface TenantAttributes {
    id: number;
    name: string;
    schema_name: string;
    plan_type: PlanType;
    contact_email: string;
    status: StatusType;
    createdAt?: Date;
    updatedAt?: Date;
}
export default (sequelize: Sequelize) => {
    // Sequelize model definition
    class Tenant extends Model { }

    Tenant.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            schema_name: {
                type: DataTypes.TEXT,
                allowNull: false,
                unique: true,
            },
            plan_type: {
                type: DataTypes.ENUM("free", "pro", "enterprise"),
                defaultValue: "free",
                allowNull: false,
            },
            contact_email: {
                type: DataTypes.TEXT,
                unique: true,
            },
            status: {
                type: DataTypes.ENUM("Y", "N"),
                defaultValue: "Y",
                allowNull: false,
            },
            createdAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
            updatedAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            sequelize, // public connection
            modelName: "Tenant",
            tableName: "tenants",
            schema: "public", // ensures it lives in the public schema
            timestamps: true,
        }
    );
    return Tenant;
};

