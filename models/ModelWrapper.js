import { dbConnection } from "../config/db";

const getModel = async (model, database) => {
    const model = dbConnection.useDb(database);
    return dbConnection.model(model, modelSchema);
}

module.exports = getModel;