import { Sequelize, DataTypes, Model } from "sequelize";

// class Subscription extends Model { }

export default (sequelize: Sequelize) => {
    class Subscription extends Model {
        static associate(db: any) {
            Subscription.belongsTo(db.User, {
                foreignKey: 'c_id',
                as: 'Customer',
            });

            Subscription.belongsTo(db.Plan, {
                foreignKey: 'plan_id',
                as: 'Plan',
            });
        }
    }

    Subscription.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            plan_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            c_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            created: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            expiry_date: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            status: {
                type: DataTypes.ENUM("Y", "N", "D"),
                allowNull: false,
                defaultValue: "Y",
            },
            payment_id: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            order_id: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            signature_razorpay: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            totaluser: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            plantotalprice: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            taxprice: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            discount: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            payment_detail: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: "0",
            },
            dropreason: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            isdrop: {
                type: DataTypes.ENUM("Y", "N"),
                defaultValue: "N",
            },
            dropdate: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            payment_date: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            razorpay_order_id: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            cgst: {
                type: DataTypes.STRING,
                defaultValue: "0",
            },
            sgst: {
                type: DataTypes.STRING,
                defaultValue: "0",
            },
            igst: {
                type: DataTypes.STRING,
                defaultValue: "0",
            },
            per_user_rate: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
            createdAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
                allowNull: false,
            },
            updatedAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
                allowNull: false,
            },
        },
        {
            sequelize,
            tableName: "subscriptions",
            modelName: 'Subscription',
            schema: "public",
            timestamps: true,
        }
    );
    return Subscription;
};