# Description
# Provide
# Usage
## basic
# Request template
```velocity
## [START] User Input
#set( $args = $ctx.args )
#set( $indexName = "article" )
#set( $allowedAggFields = ["ALLOWED_ALL_FIELDS"] ) ## Aggregation Designation Permitted Field Name(When ALLOWED_ALL_FIELDS is specified, all fields are allowed)
## [END] User Input

## [START] sort condition generation
#set( $sortValues = [] )
#set( $sortFields = [] )
#if( !$util.isNullOrEmpty($args.sort) )
  #foreach( $sortItem in $args.sort )
    #set( $temp = {
      $sortItem.field : $sortItem.direction
    } )
    $util.qr($sortValues.add($temp))
  #end
#end
## [END] sort condition generation

## [START] Aggregates applied (fields to be analyzed)
#set( $aggregateValues = {} )
#foreach( $aggItem in $args.aggregates )
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
#if( $util.isNullOrEmpty($args.filter) )
  #set( $filter = {
    "match_all": {}
  } )
#else
  #set( $filter = $util.parseJson($util.transform.toElasticsearchQueryDSL($args.filter)) )
#end
## [END] Apply Filter

{
  "version": "2018-05-29",
  "operation": "GET",
  "path": "/$indexName/_doc/_search",
  "params": {
      "body": {
                #if( !$util.isNullOrEmpty($args.nextToken) )"search_after": $util.base64Decode($args.nextToken), #end
                #if( $args.from )"from": $args.from, #end
                "size": #if( $args.limit ) $args.limit #else 100 #end,
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
