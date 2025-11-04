import { Request, Response } from 'express';
import * as schemaService from '../../services/admin/schema.service';
import { successResponse } from '../../utils/responseUtils';
import { apiErrors } from '../../utils/api-errors';

export const createSchema = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ status: false, message: 'Schema name are required' });
        }
        const result = await schemaService.createSchema(name);
        return res.json({
            status: true,
            message: 'Schema created successfully !',
            result,
        });
    } catch (error) {
        console.log("Error occures at create schema: ", error);
        return res.status(500).json({ status: false, message: 'Internal server error' });
    }
};

export const DeleteSchema = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ status: false, message: 'Schema name is required' });
        }
        const result = await schemaService.deleteSchema(name);
        return res.json({
            status: true,
            message: 'Schema deleted successfully !',
            result,
        });
    } catch (error) {
        console.log("Error occures at delete schema: ", error);
        return res.status(500).json({ status: false, message: 'Internal server error' });
    }
};

export const cloneSchema = async (req: Request, res: Response) => {
    try {
        const { oldSchema, newSchema } = req.body;
        const result = await schemaService.cloneSchemaService(oldSchema, newSchema,);
        return res.json({ status: true, message: '✅ Schema cloned !', result, });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: 'Internal server error' });
    }
};

export const getAllSchemas = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string, 10) || 1;
        const limit = parseInt(req.query.limit as string, 10) || 10;

        const result = await schemaService.getAllSchemas(page, limit);

        return res.json({
            status: true,
            message: 'Successfully fetched schemas!',
            result,
        });
    } catch (error: any) {
        console.error('Error in getAllSchemas controller:', error);
        return res.status(500).json({
            status: false,
            message: error.message || 'Failed to fetch schemas',
        });
    }
};

export const AddTableToAllSchema = async (req: Request, res: Response) => {
    const { table_name, fields, exclude_schemas = [] } = req.body;

    if (!table_name || !fields?.length) {
        return res.status(400).json({
            status: false,
            message: "Missing table_name or fields in request body",
        });
    }
    const result = await schemaService.addDynamicTableToAllSchemas(table_name, fields, exclude_schemas);
    return res.status(result.status ? 200 : 500).json(result);
};

export const DeleteTableToAllSchema = async (req: Request, res: Response) => {
    const {
        tableName,
        excludeSchemas = [],
        includeSchemas,
        cascade = false
    } = req.body;

    if (!tableName) {
        return res.status(400).json({
            status: false,
            message: "Please provide the table name you want to delete."
        });
    }

    try {
        const result = await schemaService.deleteTableFromAllSchemas({
            tableName,
            excludeSchemas,
            includeSchemas,
            cascade
        });

        res.status(result.status ? 200 : 500).json(result);
    } catch (error: any) {
        console.error("❌ DeleteTableToAllSchema error:", error);
        res.status(500).json({
            status: false,
            message: "Failed to delete table",
            error: error.message
        });
    }
};

export const AddColumnToAllSchemas = async (req: Request, res: Response) => {
    const { tableName, columnName, columnType } = req.body;
    const result = await schemaService.addColumnToAllSchemas(tableName, columnName, columnType);
    res.json(result);
};

export const DeleteColumnToAllSchemas = async (req: Request, res: Response) => {
    const { tableName, columnName } = req.body;
    const result = await schemaService.deleteColumnFromAllSchemas(tableName, columnName);
    res.json(result);
};
