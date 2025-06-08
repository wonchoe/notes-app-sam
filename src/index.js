const { DynamoDBClient, PutItemCommand, GetItemCommand } = require('@aws-sdk/client-dynamodb');

const dynamo = new DynamoDBClient({});

exports.handler = async (event) => {
    const tableName = process.env.NOTES_TABLE;
    const method = event.httpMethod;
    let body = event.body ? JSON.parse(event.body) : null;

    try {
        if (method === "POST") {
            // Create note
            const noteId = body.noteId;
            const noteText = body.text;

            await dynamo.send(new PutItemCommand({
                TableName: tableName,
                Item: {
                    noteId: { S: noteId },
                    text: { S: noteText }
                }
            }));

            return {
                statusCode: 201,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: "Note created" })
            };
        }

        if (method === "GET" && event.queryStringParameters && event.queryStringParameters.noteId) {
            // Get note
            const noteId = event.queryStringParameters.noteId;

            const data = await dynamo.send(new GetItemCommand({
                TableName: tableName,
                Key: { noteId: { S: noteId } }
            }));

            return {
                statusCode: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ note: data.Item })
            };
        }

        return {
            statusCode: 400,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: "Unsupported operation" })
        };

    } catch (e) {
        console.error("Handler error:", e);
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: "Internal server error", error: e.message })
        };
    }
};
