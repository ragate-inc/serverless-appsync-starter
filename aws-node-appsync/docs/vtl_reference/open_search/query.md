# Description

Provides VTL templates and instructions for executing queries from AppSync to OpenSearch.

# Provide

- Query execution to OpenSearch by VTL

# Usage

## basic

By modifying the "User Input" section at the top of the VTL template code, described below, queries can be generated for each use case.

Modification of code other than the "User Input" section may be done at the discretion of the developer, but is not supported by this document.

## Authorization to make requests from AppSync to OpenSearch

To make requests from AppSync to OpenSearch, you must provide AppSync with an IAM role that includes the following IAM policies

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Stmt1234234",
      "Effect": "Allow",
      "Action": ["es:ESHttpDelete", "es:ESHttpHead", "es:ESHttpGet", "es:ESHttpPost", "es:ESHttpPut"],
      "Resource": ["arn:aws:es:REGION:ACCOUNTNUMBER:domain/democluster/*"]
    }
  ]
}
```

Please set AppSync as the Principal so that AppSync can AssumeRole the IAM role.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "appsync.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

## Filter with OpenSearch

This section explains how to specify filters for OpenSearch queries.

### scheme.graphql Description

```graphql
input SearchableStringFilterInput {
  ne: String
  gt: String
  lt: String
  gte: String
  lte: String
  eq: String
  match: String
  matchPhrase: String
  matchPhrasePrefix: String
  multiMatch: String
  exists: Boolean
  wildcard: String
  regexp: String
  range: [String]
}
input SearchableIntFilterInput {
  ne: Int
  gt: Int
  lt: Int
  gte: Int
  lte: Int
  eq: Int
  range: [Int]
}
input SearchableFloatFilterInput {
  ne: Float
  gt: Float
  lt: Float
  gte: Float
  lte: Float
  eq: Float
  range: [Float]
}
input SearchableBooleanFilterInput {
  eq: Boolean
  ne: Boolean
}
input SearchableIDFilterInput {
  ne: ID
  gt: ID
  lt: ID
  gte: ID
  lte: ID
  eq: ID
  match: ID
  matchPhrase: ID
  matchPhrasePrefix: ID
  multiMatch: ID
  exists: Boolean
  wildcard: ID
  regexp: ID
  range: [ID]
}
input SearchableArticleFilterInput {
  Id:SearchableIDFilterInput
  TheStringAttribute:SearchableStringFilterInput
  TheIntAttribute:SearchableIntFilterInput
  TheFloatAttribute:SearchableFloatFilterInput
  TheBooleanAttribute:SearchableBooleanFilterInput
  TheIDSetAttribute:[SearchableIDFilterInput]
  TheStringSetAttribute:[SearchableStringFilterInput]
  TheIntSetAttribute:[SearchableIntFilterInput]
  TheFloatSetAttribute:[SearchableFloatFilterInput]
  TheBooleanSetAttribute:[SearchableBooleanFilterInput]
  and: [SearchableArticleFilterInput]
  or: [SearchableArticleFilterInput]
  not: SearchableArticleFilterInput
}
Query {
  searchArticles(
  ...
  filter: SearchableArticleFilterInput
  ): ...
}
```

### VTL Description

Get the filter arguments at the following locations

```velocity
## [START] User Input
...
#set( $filter = $ctx.args.filter )
...
## [END] User Input
```

Convert the argument Filter to OpenSearch request format at the following location.

```velocity
## [START] Apply Filter
...
#set( $filter = $util.parseJson($util.transform.toElasticsearchQueryDSL($filter)) )
...
## [END] Apply Filter
```

Finally, it is applied to the OpenSearch argument query.

```velocity
{
  "version": "2018-05-29",
  "operation": "GET",
  "path": "/$indexName/_doc/_search",
    "params": {
        "body": {
                  ...
                  "query": $util.toJson($filter),
                  ...
        }
    }
}
```

## Aggregation with OpenSearch

### scheme.graphql Description

In scheme.graphql, specify Aggregate.
Please change the attribute names, etc. to suit your requirements.

```graphql
enum SearchableAggregateType {
  terms
  avg
  min
  max
  sum
}
enum SearchableArticleAggregateField {
  Id
  Attribute1
  Attribute2
  Attribute3
  Score
  ...
}
input SearchableArticleAggregationInput {
  name: String!
  type: SearchableAggregateType!
  field: SearchableArticleAggregateField!
}
Query {
  searchArticles(
  ...
  aggregates: [SearchableArticleAggregationInput]
  ): ...
}
```

### VTL Description

OpenSearch's Aggregation feature, while useful, is an expensive operation for OpenSearch. Developers can restrict the attributes that can be Aggregated in order to prevent overloaded Aggregation requests.

In the example below, Aggregation is allowed for the attribute Score; Aggregation will not be allowed for any attribute other than Score.

```velocity
## [START] User Input
...
#set( $allowedAggFields = ["Score"] )
...
## [END] User Input
```

To allow Aggregation on all attributes, do the following

```velocity
## [START] User Input
...
#set( $allowedAggFields = ["ALLOWED_ALL_FIELDS"] )
...
## [END] User Input
```

## Sort with OpenSearch

### scheme.graphql Description

To handle sorting in OpenSearch, create a scheme.graphql like the following.

```graphql
enum SearchableSortDirection {
  asc
  desc
}
enum SearchableArticleSortableFields {
  Id
  Attribute1
  Attribute2
  Attribute3
  Score
  ...
}
input SearchableArticleSortInput {
  field: SearchableArticleSortableFields
  direction: SearchableSortDirection
}
Query {
  searchArticles(
  ...
  sort: [SearchableArticleSortInput]
  ): ...
}
```

### VTL Description

In the VTL, the argument sort is obtained at the following location.

```velocity
## [START] User Input
...
#set( $sort = $ctx.args.sort )
...
## [END] User Input
```

## Limit with OpenSearch

You can specify the number of items to be retrieved at a time in OpenSearch.

### scheme.graphql Description

Int is specified for Limit.

```graphql
Query {
  searchArticles(
  ...
  limit: Int
  ): ...
}
```

### VTL Description

Limit is obtained at the following location.

```velocity
## [START] User Input
...
#set( $limit = $args.limit )
...
## [END] User Input
```

VTL の最後の箇所で、OpenSearch の Size に設定されます。

```velocity
{
  "version": "2018-05-29",
  "operation": "GET",
  "path": "/$indexName/_doc/_search",
  "params": {
      "body": {
                ...
                "size": #if( $limit ) $limit #else 100 #end,
                ...
              }
  }
}
```

## NextToken(cursor token) with OpenSearch

The VTL provided in this document offers cursor token functionality with NextToken.

### scheme.graphql Description

Set nextToken to a String.

```graphql
Query {
  searchArticles(
  ...
  nextToken: String
  ): ...
}
```

### VTL Description

```velocity
## [START] User Input
...
#set( $nextToken = $ctx.nextToken )
...
## [END] User Input
```

## From with OpenSearch

In the VTL of this document, Offset can be specified for OpenSearch queries.

### scheme.graphql Description

Set from to a Int.

```graphql
Query {
  searchArticles(
  ...
  from: Int
  ): ...
}
```

### VTL Description

```velocity
## [START] User Input
...
#set( $from = $args.from )
...
## [END] User Input
```

# Request template

```velocity
## [START] User Input
#set( $indexName = "your index name here" )
#set( $sort = $ctx.args.sort )
#set( $aggregates = $ctx.args.aggregates )
#set( $filter = $ctx.args.filter )
#set( $from = $args.from )
#set( $limit = $args.limit )
#set( $nextToken = $ctx.nextToken )
#set( $allowedAggFields = ["ALLOWED_ALL_FIELDS"] ) ## Aggregation Designation Permitted Field Name(When ALLOWED_ALL_FIELDS is specified, all fields are allowed)
## [END] User Input

## [START] sort condition generation
#set( $sortValues = [] )
#set( $sortFields = [] )
#if( !$util.isNullOrEmpty($.sort) )
  #foreach( $sortItem in $sort )
    #set( $temp = {
      $sortItem.field : $sortItem.direction
    } )
    $util.qr($sortValues.add($temp))
  #end
#end
## [END] sort condition generation

## [START] Aggregates applied (fields to be analyzed)
#set( $aggregateValues = {} )
#foreach( $aggItem in $aggregates )
  #if( $allowedAggFields[0] == "ALLOWED_ALL_FIELDS" )
    #set( $aggFilter = { "match_all": {} } )
  #elseif( $allowedAggFields.contains($aggItem.field) )
    #set( $aggFilter = { "match_all": {} } )
  #else
    $util.error("Unauthorized to run aggregation on field: ${aggItem.field}", "Unauthorized")
  #end
  $util.qr($aggregateValues.put("$aggItem.name", { "filter": $aggFilter, "aggs": { "$aggItem.name": { "$aggItem.type": { "field": "$aggItem.field" } } } }))
#end
## [END] Aggregates applied (fields to be analyzed)

## [START] Apply Filter
#if( $util.isNullOrEmpty($filter) )
  #set( $filter = {
    "match_all": {}
  } )
#else
  #set( $filter = $util.parseJson($util.transform.toElasticsearchQueryDSL($filter)) )
#end
## [END] Apply Filter

{
  "version": "2018-05-29",
  "operation": "GET",
  "path": "/$indexName/_doc/_search",
  "params": {
      "body": {
                #if( !$util.isNullOrEmpty($nextToken) )"search_after": $util.base64Decode($nextToken), #end
                #if( $from )"from": $from, #end
                "size": #if( $limit ) $limit #else 100 #end,
                "sort": $util.toJson($sortValues),
                "version": false,
                "query": $util.toJson($filter),
                "aggs": $util.toJson($aggregateValues)
              }
  }
}
```

# Response template

```velocity
#if( $ctx.error )
  $util.error($ctx.error.message, $ctx.error.type)
#end

#set( $es_items = [] )
#set( $aggregateValues = [] )
#foreach( $entry in $context.result.hits.hits )
  #if( !$foreach.hasNext )
    #set( $nextToken = $util.base64Encode($util.toJson($entry.sort)) )
  #end
  $util.qr($es_items.add($entry.get("_source")))
#end
#foreach( $aggItem in $context.result.aggregations.keySet() )
  #set( $aggResult = {} )
  #set( $aggResultValue = {} )
  #set( $currentAggItem = $ctx.result.aggregations.get($aggItem) )
  $util.qr($aggResult.put("name", $aggItem))
  #if( !$util.isNullOrEmpty($currentAggItem) )
    #if( !$util.isNullOrEmpty($currentAggItem.get($aggItem).buckets) )
      ## $util.qr($aggResultValue.put("__typename", "SearchableAggregateBucketResult"))
      $util.qr($aggResultValue.put("buckets", $currentAggItem.get($aggItem).buckets))
    #end
    #if( !$util.isNullOrEmpty($currentAggItem.get($aggItem).value) )
      ## $util.qr($aggResultValue.put("__typename", "SearchableAggregateScalarResult"))
      $util.qr($aggResultValue.put("value", $currentAggItem.get($aggItem).value))
    #end
  #end
  $util.qr($aggResult.put("result", $aggResultValue))
  $util.qr($aggregateValues.add($aggResult))
#end
$util.toJson({
  "items": $es_items,
  "total": $ctx.result.hits.total.value,
  "nextToken": $nextToken,
  "aggregateItems": $aggregateValues
})
```
