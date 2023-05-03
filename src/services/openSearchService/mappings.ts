import _ from 'lodash';
import { OPENSEARCH_INDEX_NAME } from 'services/openSearchService';

/**
 * Generate field names for documents when registering with OpenSearch
 * @description The information in the arguments is used to generate and return appropriate field names.
 */
export default (args: { indexName: OPENSEARCH_INDEX_NAME; fieldName: string; item: Record<string, unknown> }): string => {
  // Set appropriate key name
  // const mappings = {
  //   [OPENSEARCH_INDEX_NAME.user]: {
  //     About: {},
  //   },
  // };
  // const faceName = 'About';
  // if (faceName) {
  //   const res = _.get(mappings, `${args.indexName}.${faceName}.${args.fieldName}`, undefined) as string;
  //   if (res) return res;
  // }
  // const res = _.get(mappings, `${args.indexName}.${args.fieldName}`, undefined) as string;
  // if (res) return res;
  return args.fieldName;
};
