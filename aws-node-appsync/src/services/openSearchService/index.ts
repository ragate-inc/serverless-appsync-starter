import { SignatureV4, SignatureV4CryptoInit, SignatureV4Init } from '@aws-sdk/signature-v4';
import { HttpRequest } from '@aws-sdk/protocol-http';
import { Sha256 } from '@aws-crypto/sha256-js';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import { NodeHttpHandler } from '@aws-sdk/node-http-handler';
import { IncomingMessage } from 'http';
import _ from 'lodash';
import getFieldName from 'services/openSearchService/mappings';
import { BadRequestError } from 'exceptions/index';
import { AWS_REGION } from 'types/index';

export enum OPENSEARCH_INDEX_NAME {
  user = 'user',
}

enum HTTP_METHOD {
  // Document creation request to OpenSearch, specified when INSERTing a DynamoDBStream
  POST = 'POST',
  // Document update request to OpenSearch, specified at the time of MODIFY of DynamoDBStream
  PUT = 'PUT',
  // Request to OpenSearch to delete document, specified at MODIFY of DynamoDBStream, specified at REMOVE of DynamoDBStream
  DELETE = 'DELETE',
  // Document search request to OpenSearch
  GET = 'GET',
}

interface Option {
  method: HTTP_METHOD;
  documentData: Record<string, unknown>;
  primaryKeyValue?: string | number;
  hostname?: string;
  service?: string;
  headers?: Record<string, string>;
  port?: number;
  protocol?: string;
  query?: Record<string, string>;
}

export default class {
  constructor(args: { indexName: OPENSEARCH_INDEX_NAME; opt: Option }) {
    const { opt, indexName } = args;
    const { REGION, OS_DOMAIN_ENDPOINT } = process.env;
    if (_.isEmpty(REGION)) {
      throw new BadRequestError(
        `Environment variable "REGION" or argument is not set \n ${JSON.stringify(
          {
            ...(args || {}),
            ...(process.env || {}),
          },
          null,
          2
        )}`
      );
    }
    if (_.isEmpty(OS_DOMAIN_ENDPOINT)) {
      throw new BadRequestError(
        `The environment variable "OS_DOMAIN_ENDPOINT" or argument is not set \n ${JSON.stringify(
          {
            ...(args || {}),
            ...(process.env || {}),
          },
          null,
          2
        )}`
      );
    }
    const getPath = () => {
      if (opt.method === HTTP_METHOD.POST) {
        if (_.isEmpty(opt.primaryKeyValue)) return `${indexName}/_doc/`;
        return `${indexName}/_doc/${_.toString(opt.primaryKeyValue)}`;
      }
      if (opt.method === HTTP_METHOD.PUT || opt.method === HTTP_METHOD.DELETE) {
        return `${indexName}/_doc/${_.toString(opt.primaryKeyValue)}/`;
      }
      if (opt.method === HTTP_METHOD.GET) {
        if (_.isEmpty(opt.primaryKeyValue)) return `${indexName}/_search/`;
        return `${indexName}/_doc/${_.toString(opt.primaryKeyValue)}`;
      }
    };
    const sigV4Init: SignatureV4Init & SignatureV4CryptoInit = {
      credentials: defaultProvider(),
      region: REGION as AWS_REGION,
      service: opt.service || 'es',
      sha256: Sha256,
    };
    const hostName = opt.hostname || OS_DOMAIN_ENDPOINT;
    const headers: Record<string, string> = (opt.headers || {
      'Content-Type': 'application/json',
      host: hostName,
    }) as Record<string, string>;
    const option = {
      headers,
      hostname: hostName,
      method: opt.method,
      path: getPath(),
      port: opt.port || 443,
      protocol: opt.protocol || 'https:',
      query: opt.query,
      body: JSON.stringify(this._convertDynamodItemToOsDocument({ indexName, item: opt.documentData })),
    };
    this.httpRequestParameter = new HttpRequest(option);
    this.signer = new SignatureV4(sigV4Init);
    this.nodeHttpHandler = new NodeHttpHandler();
  }

  private httpRequestParameter: HttpRequest;
  private signer: SignatureV4;
  private nodeHttpHandler: NodeHttpHandler;

  private _convertDynamodItemToOsDocument(args: { indexName: OPENSEARCH_INDEX_NAME; item: Record<string, unknown> }): Record<string, unknown> {
    return _.reduce(
      args.item,
      (result, value, key) => {
        const fieldName = getFieldName({ indexName: args.indexName, fieldName: key, item: args.item });
        return {
          [fieldName]: value,
          ...result,
        };
      },
      {}
    );
  }

  public async request(): Promise<string> {
    const request = (await this.signer.sign(this.httpRequestParameter)) as HttpRequest;
    const res = await this.nodeHttpHandler.handle(request);
    return new Promise((resolve, reject) => {
      try {
        const incomingMessage = res.response.body as IncomingMessage;
        let body = '';
        incomingMessage.on('data', (chunk: string) => {
          body += chunk;
        });
        incomingMessage.on('end', () => {
          resolve(body);
        });
        incomingMessage.on('error', (err) => {
          reject(err);
        });
      } catch (e) {
        const err: Error = e as Error;
        reject(err);
      }
    });
  }
}
