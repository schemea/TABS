namespace GAPI {
    export type JsonSchema = any;
    export type RestResource = any;

    namespace Discovery {

        export interface Parameter {
            "id": string,
            "type": string,
            "$ref": string,
            "description": string,
            "default": string,
            "required": boolean,
            "format": string,
            "pattern": string,
            "minimum": string,
            "maximum": string,
            "enum": string[],
            "enumDescriptions": string[],
            "repeated": boolean,
            "location": string,
            "properties": Record<string, JsonSchema>,
            "additionalProperties": JsonSchema,
            "items": JsonSchema,
            "annotations": {
                "required": [
                    string
                ]
            }
        }


        export type Scope = { "description": string };

        type Schema = {
            "id": string,
            "type": string,
            "$ref": string,
            "description": string,
            "default": string,
            "required": boolean,
            "format": string,
            "pattern": string,
            "minimum": string,
            "maximum": string,
            "enum": [
                string
            ],
            "enumDescriptions": [
                string
            ],
            "repeated": boolean,
            "location": string,
            "properties": Record<string, JsonSchema>,
            "additionalProperties": JsonSchema,
            "items": JsonSchema,
            "annotations": {
                "required": [
                    string
                ]
            }
        };

        type Method = {
            "id": string,
            "path": string,
            "httpMethod": string,
            "description": string,
            "parameters": Record<string, Parameter>,
            "parameterOrder": [ string ],
            "request": { "$ref": string },
            "response": { "$ref": string },
            "scopes": unknown[],
            "supportsMediaDownload": boolean,
            "supportsMediaUpload": boolean,
            "mediaUpload": {
                "accept": string[],
                "maxSize": string,
                "protocols": {
                    "simple": {
                        "multipart": true,
                        "path": string
                    },
                    "resumable": {
                        "multipart": true,
                        "path": string
                    }
                }
            },
            "supportsSubscription": boolean
        };

        type Resource = {
            "methods": Record<string, Method>,
            "resources": Record<string, RestResource>
        };

        export interface Response {
            "kind": "discovery#restDescription",
            "discoveryVersion": "v1",
            "id": string,
            "name": string,
            "canonicalName": string,
            "version": string,
            "revision": string,
            "title": string,
            "description": string,
            "icons": {
                "x16": string,
                "x32": string
            },
            "documentationLink": string,
            "labels": string[],
            "protocol": "rest",
            "baseUrl": string,
            "basePath": string,
            "rootUrl": string,
            "servicePath": string,
            "batchPath": "batch",
            "parameters": Record<string, Parameter>,
            "auth": {
                "oauth2": {
                    "scopes": Record<string, Scope>
                }
            },
            "features": string[],
            "schemas": Record<string, Schema>,
            "methods": Record<string, Method>,
            "resources": Record<string, Resource>
        }
    }
}
